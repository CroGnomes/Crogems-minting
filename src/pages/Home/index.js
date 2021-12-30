import React, { useState, useEffect } from 'react';

import { ToastContainer, toast } from "react-toastify";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import Web3 from 'web3';
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Header } from "../../components/Header";
import Footer from "../../components/Footer";
import contractConfig from '../../contractConfig';
import { getImg } from "../../utils/Helper";
import Styles from './Home.module.scss';
import { Typography } from '@mui/material';
import { errorAlert, warningAlert } from '../../components/toastGroup';
import LoadingSpin from "react-loading-spin";

const MintAlert = withReactContent(Swal);
let web3 = undefined;
let web3Modal = undefined;
let connection = undefined;
let provider = undefined;
let signer = undefined;
let contract = undefined;

const CHAIN_ID = 338;

const errors = [
 /*0*/ "The wrong network, please switch to the Cronos network.",
 /*1*/  "First, you should connect it with your wallet.",
 /*2*/  "You can't get more Cronos at this stage!",
 /*3*/  "SALE has not Started!",
 /*4*/  "Amount Exceed!",
 /*5*/  "Amount Exceed! No more than 1700 NFTs are provided during the pre-sale stage.",
 /*6*/  "You are not a WhiteListed Person! In the pre-sale stage, only owners in the WhiteListed can get.",
 /*7*/  "In PRESALE Stage, you can buy ONLY 2 Cronos!",
 /*8*/  "Your balance is not enough.",
 /*9*/  "You can buy a maximum of 4 Cronos.",
/*10*/  "Oops. We find the unknown error. Please try again.",
]

export const Home = () => {
    const [input, setInput] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [signerAddress, setSignerAddress] = useState("");
    const [currentBalance, setCurrentBalance] = useState(0);
    const [totalMinted, setTotalMinted] = useState(0)
    // const [currentStage, setCurrentStage] = useState(0) // 0: pre-sail stage, 1: public stage
    // const [totalPrice, setTotalPrice] = useState(PRICE[0]);
    const [amount, setAmount] = useState(1);
    const [started, setStarted] = useState(false);
    const [timeLimit, setTimeLimit] = useState(true); // timelimit is true for 3 hours
    const [incLoding, setIncLoading] = useState(false);
    const [decLoding, setDecLoading] = useState(false);
    const [locked, setLocked] = useState(true);

    const CHAIN_ID = 25;

    const checkNetwork = async () => {
        web3 = new Web3(Web3.givenProvider);
        const chainId = await web3.eth.getChainId()
        if (chainId !== CHAIN_ID) {
          errorAlert(errors[0]);
          return false
        } else {
          return true
        }
    }


    const increse = () => {
        if (input < 10) {
            setInput(input + 1);
        }
    };

    const decrease = () => {
        if (input >= 1) {
            setInput(input - 1);
        }
    };

    const getmax = () => {
        setInput(10);
    };

    const handleConnect = async () => {
        if (await checkNetwork())

          window.ethereum
            .request({ method: 'eth_requestAccounts' })
            .then(
              async () => {
                setSignerAddress(await getSignerAddress());
                localStorage.setItem('wallet', await getSignerAddress());
                setCurrentBalance(await getSignerBalance(await getSignerAddress()));
                setConnected(true);
                setLocked(false);
                toast.dismiss();
                web3Modal = new Web3Modal();
                connection = await web3Modal.connect();
                provider = new ethers.providers.Web3Provider(connection);
                signer = provider.getSigner();
                contract = new ethers.Contract(
                    contractConfig.address,
                    contractConfig.abi,
                  signer
                );
                // setTotalMinted(await getTotalMinted());
                // await getStartSale();
                // await checkTimeLimit();
                await getSignerBalance(await getSignerAddress());
              }
            )
            .catch((err) => {
              if (err.code === -32002) {
                warningAlert('Please connect to MetaMask!')
              } else if (err.code === 4001) {
                warningAlert('You rejected the connect, please connect the MetaMask');
              } else {
                console.log(err);
              }
            });
        else {
            
        }    
    }

    const getSignerAddress = async () => {
        const accounts = await web3.eth.getAccounts();
        if (accounts[0] === undefined) {
          setConnected(false)
          return false
        }
        else return accounts[0]
    }

    const getSignerBalance = async (address) => {
        const balance = await web3.eth.getBalance(address);
        setCurrentBalance(balance);
        return balance;
    }

    const _mint = async () => {
        toast.dismiss();
        setIsLoading(true);
        try {
          if (!await checkNetwork()) { setIsLoading(false); return; }
          if (!await getSignerAddress()) throw 1;

          const accounts = localStorage.getItem('wallet');
          const value = input * 275 ;
          await contractConfig.methods.mint(input).send({
                from : accounts,
                value: web3.utils.toWei(value.toString(), 'ether')
          });
    
          MintAlert.fire({
            title:
              <Typography component="h2">
                Congratulation!
              </Typography>,
            html:
              <Typography component="p">
                You got the Cronos.
              </Typography>,
            icon: 'success'
          })
    
          getSignerBalance(signerAddress);
        } catch (err) {
          setIsLoading(false);
          if (err < 10) {
            errorAlert(errors[err]);
          } else if (err === 11) {
            // errorAlert(`You can buy a maximum of 4 Cronos. You already got ${await getBalanceOf(signerAddress)} Zilla(s).`)
          } else {
            errorAlert(errors[10]);
            console.log(err);
          }
        }
        setIsLoading(false);
    }

    // useEffect(() => {
    //     handleConnect();
    // }, [signerAddress, currentBalance])

    useEffect(async () => {
        const addr = localStorage.getItem('wallet')
        console.log('address:',addr)
        if(!!addr) {
            handleConnect()
        }
    }, [])

    useEffect(async () => {
        window.ethereum.on('chainChanged', (chainId) => {
            if (parseInt(chainId) === CHAIN_ID) {
            handleConnect()
            setLocked(false);
            } else {
            setConnected(false);
            setLocked(true);
            checkNetwork();
            }
    })

    window.ethereum.on('accountsChanged', () => {
        setConnected(false);
        setLocked(true);
        checkNetwork();
    }, [handleConnect]);


    }, [])

    return (
        <div className={Styles.home}>
            <Header connected={connected} handleConnect={handleConnect} address={signerAddress}/>
            <div className={Styles.container}>
                <div className={Styles.cardcontent}>
                    <div className={Styles.home_title}>          
                        House your Crognomes
                    </div>
                    <div className={Styles.home_amount_title}>
                        Amount
                    </div>
                    <div className={Styles.home_amount}>
                        <button onClick={decrease}></button>
                        <input value={input} defaultValue={10} />
                        <button onClick={increse}></button>
                        <a onClick={getmax}>Get Max</a>
                    </div>
                    <div className={Styles.home_total}>
                        Total {Math.round(275 * input * 100) / 100} CRO
                    </div>
                    <div className={Styles.home_mint}>
                        <button className={Styles.mint_btn} onClick={_mint}>
                            {!isLoading ? "MINT" : <LoadingSpin size="34px" width="4px" />}
                        </button>
                    </div>
                    <div className={Styles.home_available}>
                        <div className={Styles.available_container}>
                            <div className={Styles.available}>
                                <div className={Styles.available_first}>Available</div>
                                <div className={Styles.available_second}>2.000 / 2.000</div>
                                <div>
                                    <img className={Styles.available_img1} src={getImg('home/Export-1.png')} alt="Logo" />
                                    <img className={Styles.available_img2} src={getImg('home/Export-2.png')} alt="Logo" />
                                    <img className={Styles.available_img3} src={getImg('home/Export-3.png')} alt="Logo" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <ToastContainer style={{ fontSize: 12, padding: "5px !important", lineHeight: "15px" }} />
        </div>
    )
}
