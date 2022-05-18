import axios from 'axios'
import React, { useState } from 'react'
import { Row } from 'react-bootstrap'
import { Container } from 'react-bootstrap/lib/Tab'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { bindActionCreators } from 'redux'
import useArray from '../../../customHooks/useArray'
import useFetch from '../../../customHooks/useFetch'
import Manager from '../../../models/Manager'
import Prosumer from '../../../models/Prosumer'
import UserData from '../../../models/userdata'
import { ActionCreators } from '../../../redux/actions'
import { State } from '../../../redux/reducers'
import ControlTemplate from '../template'
import ProsumerBody from './body'
import ProsumerHeader from './header'

export interface ManagerControlProps{
  id: string,
  sim: string,

}

export default function ManagerControlComponent({sim, id}: ManagerControlProps) {
  const managers = useArray<Manager>();
  const prosumers = useArray<Prosumer>();
  const user= useSelector((state: State) => state.user) as UserData | undefined;
  const updateValues = async () => {
    if(user){
      user.managers?.forEach(v => {
        axios.get(process.env.BACKEND_URL + `/${sim}/api/v1/members/managers/${v.id}`, { headers: {
          'content-type': 'application/json',
          'Authentication': user.token
        }}).then(
          (res) => {
            managers.push(res.data as Manager)
          }
        ).catch((err) => console.log(err))
      })

      user.prosumers?.forEach(v => {
        axios.get(process.env.BACKEND_URL + `/${sim}/api/v1/members/prosumers/${v.id}`, { headers: {
          'content-type': 'application/json',
          'Authentication': user.token
        }}).then(
          (res) => {
            managers.push(res.data as Manager)
          }
        ).catch((err) => console.log(err))
      })
    }
  }
  const sendNewValues = () => {

  }
  
  return (
    <ControlTemplate head={<ProsumerBody />} body={<ProsumerHeader />} />
  )
}
