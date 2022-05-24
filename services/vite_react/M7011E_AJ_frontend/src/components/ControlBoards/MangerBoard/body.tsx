import React from 'react'
import { Col, Row } from 'react-bootstrap'
import Loading from '../../utils/loading'
import ControlCard from '../controlcard'

export interface ManagerBodyProps {

}

export default function ManagerBody() {
  // TODO: do table instead
  return (
    <>
      <Row className='md-12'>
        <Col className='md-5'>
          <ControlCard body={"price"} title={'price'} />
        </Col>
        <Col className='md-5'>
          <ControlCard body={"total demand"} title={'total demand'} />
        </Col>
      </Row>
      <Row className='md-12'>
        <Col className='md-5'>
          <ControlCard body={"production"} title={'production'} />
        </Col>
        <Col className='md-5'>
          <ControlCard body={"production children"} title={'production children'} />
        </Col>
      </Row>
      <Row className='md-12'>
        <Col className='md-5'>
          <ControlCard body={"ratio"} title={'ratio'} />
        </Col>
        <Col className='md-5'>
          <ControlCard body={"consumption"} title={'consumption'} />
        </Col>
      </Row>
      <Loading active={false}>
        {/* user children quick card */}
      </Loading>
    </>
  )
}
