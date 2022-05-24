import React, { useState } from 'react'
import { Row } from 'react-bootstrap'
import { Container } from 'react-bootstrap/lib/Tab'
import Manager from '../../../models/Manager'
import UserData from '../../../models/userdata'
import CardContainer from '../../utils/CardContainer'
import GridTable from '../../utils/GridTable'
import ControlCard from '../controlcard'
import ControlTemplate from '../template'
import ManagerHeader from './header'
export interface ManagerControlProps {
  id: string,
  sim: string,

}
export default function ManagerControlComponent({ id, sim }: ManagerControlProps) {



  return (
    <ControlTemplate head={<ManagerHeader />}>

      <CardContainer width={2}>
        <ControlCard title={'Price'}>
          <p>Price Body lamo</p>
        </ControlCard>
        <ControlCard title={'Total Demand'}>
          <p>Price Body lamo</p>
        </ControlCard>
        <ControlCard title={'Test Demand'}>
          <p>Price Body lamo</p>
        </ControlCard>
        <ControlCard title={'Bomm Demand'}>
          <p>Price Body lamo</p>
        </ControlCard>
      </CardContainer>

    </ControlTemplate>
  )
}
