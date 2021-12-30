import React, { useState } from "react";
import { propTypes } from "react-bootstrap/esm/Image";

import { getImg } from "../../utils/Helper";
import Styles from './Header.module.scss';
// import Hamburger from 'hamburger-react';
// import styled from 'styled-components';

export const Header = (props) => {

    return (
        <header className={Styles.header}>
            <img className={Styles.logo} src={getImg('home/logohome.png')} alt="Logo" />
            <div className={Styles.header_menu}>
                {/* <a href="#">The Story</a>
                <a href="#">Roadmap</a>
                <a href="#">Housing a Crognome</a>
                <a href="#">FAQ</a> */}
            </div>
            {!props.connected && <button onClick={props.handleConnect} className={Styles.header_btn}>CONNECT YOUR<br />WALLET</button>}
            {props.connected && <button className={Styles.header_btn}>{props.address.substr(0, 6)}...{props.address.substr(props.address.length - 4, 4)}</button>}
            
        </header>
    )
}