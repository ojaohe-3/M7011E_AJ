import React from 'react'
import { Container } from 'react-bootstrap';
import UserData from '../../models/userdata';
import './header.css'
import Logo from '../../public/image/logo.png';
import Exit from '../../public/image/exit.png';
export interface HeaderProps {
  user?: UserData,
  img?: string // TODO
  onLogout?: () => void
}

export default function Header({ user, img, onLogout }: HeaderProps) {
  return (
    <header>
      <>
      <img src={Logo} alt="logo" id="logo"/>
        <h1>Green Lean Electric</h1>
        { user ? <img id="exit" src={Exit} onClick={onLogout} /> : <></>}
        <div className="headerLine"></div>  
      </>
      </header>
        )
} 

