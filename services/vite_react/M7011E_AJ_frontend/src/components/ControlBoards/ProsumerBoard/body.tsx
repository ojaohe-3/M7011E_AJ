import React from 'react'
import { Col, Row } from 'react-bootstrap'
import Loading from '../../utils/loading'
import ControlCard from '../controlcard'

export interface ProsumerBodyProps{

}

export default function ProsumerBody() {
  return (
      <>
      <Row className='md-12'>
        <Col className='md-5'>
          <ControlCard body={"price"} title={'price'}/>
        </Col>
        <Col className='md-5'>
          <ControlCard body={"total demand"} title={'total demand'}/>
        </Col>
      </Row>
      <Row className='md-12'>
        <Col className='md-5'>
          <ControlCard body={"production"} title={'production'}/>
        </Col>
        <Col className='md-5'>
          <ControlCard body={"production children"} title={'production children'}/>
        </Col>
      </Row>
      <Row className='md-12'>
        <Col className='md-5'>
          <ControlCard body={"battery ratio"} title={'ratio'}/>
        </Col>
        <Col className='md-5'>
          <ControlCard body={"own consumption"} title={'consumption'}/>
        </Col>
      </Row>
      <Loading active={false}>
        {/* user children quick card */}
      </Loading>
      </>
  )
}
