import React from 'react'
import { Col, Row } from 'react-bootstrap'

export interface ManagerHeaderProps{

}

export default function ManagerHeader() {
  return (
      <>
      <div style={{borderStyle: 'groove'}}>
        <Row>
          <Col>
            1
          </Col>

          <Col>
            2
          </Col>

          <Col>
            3 
          </Col>
        </Row>
      </div>
      </>
  )
}
