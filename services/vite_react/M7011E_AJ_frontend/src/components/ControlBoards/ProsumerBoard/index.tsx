import axios from 'axios'
import React, { useState } from 'react'
import { Row } from 'react-bootstrap'
import { Container } from 'react-bootstrap/lib/Tab'

import useArray from '../../../customHooks/useArray'
import useFetch from '../../../customHooks/useFetch'
import Manager from '../../../models/Manager'
import Prosumer from '../../../models/Prosumer'
import UserData from '../../../models/userdata'
import GridTable from '../../utils/GridTable'
import ControlTemplate from '../template'
import ProsumerHeader from './header'
import '../../../public/style/prosumer.css'
import ControlCard from '../controlcard'
export interface ProsumerControlProps {
  id: string,
  sim: string,

}

export default function ProsumerControlComponent({ sim, id }: ProsumerControlProps) {
  const managers = useArray<Manager>();
  const prosumers = useArray<Prosumer>();
  const updateValues = async () => {

  }
  const sendNewValues = () => {

  }

  return (
    <ControlTemplate head={<ProsumerHeader />}>
      

        <ControlCard title={'Price'}>
            Price
        </ControlCard>
        <ControlCard title={'Total Demand'}>
            Demand
        </ControlCard>
    </ControlTemplate>
  )
}
