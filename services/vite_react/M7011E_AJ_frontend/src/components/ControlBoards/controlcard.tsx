import React, { CSSProperties } from 'react'
import { Card } from 'react-bootstrap'

export interface ControlCardProps {
  body?: React.ReactNode
  footer?: React.ReactNode
  title: string
  bodyClass?: string,
  footerClass?: string,
  headerClass?: string,
  style?: CSSProperties
}
export default function ControlCard({ body, footer, title, style, bodyClass, footerClass, headerClass }: ControlCardProps) {

  return (
    <>
      <Card style={style}>
        <Card.Header className={headerClass}>
          <Card.Title><h4>{title}</h4></Card.Title>
        </Card.Header>
        <Card.Body className={bodyClass}>
          {body}
        </Card.Body>
        <Card.Footer className={footerClass}>
          {footer}
        </Card.Footer>
      </Card>
    </>
  )
}
