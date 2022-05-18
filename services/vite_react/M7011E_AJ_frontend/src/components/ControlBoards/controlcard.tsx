import React, { CSSProperties } from 'react'
import { Card } from 'react-bootstrap'

export interface ControlCardProps {
  head?: React.ReactNode
  body?: React.ReactNode
  footer?: React.ReactNode
  bodyClass?: string,
  footerClass?: string,
  headerClass?: string,
  style?: CSSProperties
}
export default function ControlCard({ head, body, footer, style, bodyClass, footerClass, headerClass }: ControlCardProps) {

  return (
    <>
      <Card style={style}>
        <Card.Header className={headerClass}>
          {head}
        </Card.Header><Card.Body className={bodyClass}>
          {body}
        </Card.Body><Card.Footer className={footerClass}>
          {footer}
        </Card.Footer>
      </Card>
    </>
  )
}
