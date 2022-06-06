import React, { useState } from 'react'
import { Col, Form, FormControl, FormGroup, InputGroup, Row } from 'react-bootstrap'
import { Container } from 'react-bootstrap/lib/Tab'
import Manager from '../../../models/Manager'
import UserData from '../../../models/userdata'
import CardContainer from '../../utils/CardContainer'
import GridTable from '../../utils/GridTable'
import ControlCard from '../controlcard'
import ItemWithGraph from '../itemWithGraph'
import ControlTemplate from '../template'
import ManagerHeader from './header'
export interface ManagerControlProps {
  id: string,
  sim: string,

}
export default function ManagerControlComponent({ id, sim }: ManagerControlProps) {



  return (
    <>
      <ControlTemplate head={<ManagerHeader />}>
        <Row>
          <Col>
            <CardContainer width={2}>
              <ControlCard title={'Price'}>
                <ItemWithGraph value={0.05} data={[]} valueTitle="price"/>
                {/* Graphcomponent */}
              </ControlCard>
              <ControlCard title={'Total Demand'}>
                <p>used tickets</p>
                {/* Graphcomponent */}
              </ControlCard>
              <ControlCard title={'Production'}>
                <p>Production</p>
                {/* Graphcomponent */}
              </ControlCard>
              <ControlCard title={'Ratio'}>
                <p>ratio</p>
                {/* Graphcomponent */}
              </ControlCard>
              <ControlCard title={'Income'}>
                <p>earnings</p>
              </ControlCard>
              <ControlCard title={'Controlbox'}>
                <Row>
                  <Col>
                      <Form.Range onChange={(e: any) => console.log(e)} />
                  </Col>
                  <Col>

                      <Form.Check  onChange={(e: any) => console.log(e)} type="switch" label="status"/>
                  </Col>
                </Row>
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
      </ControlTemplate ></>
  )
}
