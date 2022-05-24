import React, { CSSProperties } from 'react'
import { Card } from 'react-bootstrap'
import "../../public/style/cards.css"
export interface ControlCardProps {
  children?: React.ReactNode | React.ReactNode[]
  footer?: React.ReactNode
  title: string
  style?: CSSProperties
}
export default function ControlCard({ children, footer, title, style}: ControlCardProps | any) {

  return (
    <>
      <Card style={style} className="control-card">
        <Card.Header className={"control-card-head"}>
          <Card.Title><h4>{title}</h4></Card.Title>
        </Card.Header>
        <Card.Body className={"control-card-body"}>
          {children}
        </Card.Body>
        <Card.Footer className={"control-card-footer"}>
          {footer}
        </Card.Footer>
      </Card>
    </>
  )
}
