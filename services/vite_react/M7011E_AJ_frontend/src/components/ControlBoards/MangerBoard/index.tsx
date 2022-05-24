import React, { useState } from 'react'
import { Row } from 'react-bootstrap'
import { Container } from 'react-bootstrap/lib/Tab'
import Manager from '../../../models/Manager'
import UserData from '../../../models/userdata'
import ControlTemplate from '../template'
import ManagerBody from './body'
import ManagerHeader from './header'
export interface ManagerControlProps{
  id: string,
  sim: string,

}
export default function ManagerControlComponent({id, sim} : ManagerControlProps) {


  
  return (
    <ControlTemplate head={<ManagerHeader/>} body={<ManagerHeader />} />
  )
}
