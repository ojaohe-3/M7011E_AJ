import { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap';
import ProsumerControlComponent from './components/ControlBoards/ProsumerBoard';
import LoginPopup from './components/Popups/LoginPopup';
import './index.css'
import Header from './components/Header';
import { useSessionStorage } from './customHooks';
import UserData from './models/userdata';
import ManagerControlComponent from './components/ControlBoards/MangerBoard';

function App() {

  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser, removeUser] = useSessionStorage<UserData | undefined>("user", undefined);
  const handleClose = () => setShowLogin(false);
  const handleShow = () => setShowLogin(true);
  const handleLogout = () => removeUser();
  const handleLogin = (u: UserData) => {
    setUser(u);
    setShowLogin(false);
    // console.log(u);
    // console.log(user);
  }



  return (
    <>
      <LoginPopup
        display={showLogin} onClose={handleClose} onLogin={handleLogin} />
      <Header user={user} onLogout={handleLogout} />
      {/* <LoginPopup display={show} onClose={handleClose} onLogin={(u) => console.log("login message:", u)} /> */}
      <div id="App">
        <Row>
          <Col>
            <Button variant="primary" onClick={handleShow}>
              login!
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
          <ManagerControlComponent id={''} sim={''} />
          {/* <ProsumerControlComponent id={''} sim={''}/> */}
          </Col>
        </Row>
        
      </div></>
  )
}

export default App
