import axios from 'axios'
import React, { useState } from 'react'

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
import CardContainer from '../../utils/CardContainer'
import { Col, Row } from 'react-bootstrap'
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
      <Row>
        <Col>
          <CardContainer width={2}>
            <ControlCard title={'Price'}>
              <p>price</p>
              {/* Graphcomponent */}
            </ControlCard>
            <ControlCard title={'Total Demand'}>
              <p>used tickets</p>
              {/* Graphcomponent */}
            </ControlCard>
            <ControlCard title={'Self Demand'}>
              <p>self demand</p>
              {/* Graphcomponent */}
            </ControlCard>
            <ControlCard title={'Total Production'}>
              <p>Production</p>
              {/* Graphcomponent */}
            </ControlCard>
            <ControlCard title={'Batteries'}>
              <p>Batteries</p>
              {/* Graphcomponent */}
            </ControlCard>
            <ControlCard title={'Ratios'}>
              <p>ratio out</p>
              <p>ratio in</p>
              {/* Graphcomponent */}
            </ControlCard>
            <ControlCard title={'Income'}>
              <p>earnings</p>
            </ControlCard>
            <ControlCard title={'Controlbox'}>
              {/* Input */}
            </ControlCard>
          </CardContainer>
        </Col>
      </Row>
      <Row style={{ paddingTop: '11%' }}>
        <Col >
          <h2> Members: </h2>
        </Col>
      </Row>
      <Row>
        <Col>
          <CardContainer width={1}>
            <ControlCard title={'test place holder'}></ControlCard>
          </CardContainer>
        </Col>
      </Row>
    </ControlTemplate>
  )
}
