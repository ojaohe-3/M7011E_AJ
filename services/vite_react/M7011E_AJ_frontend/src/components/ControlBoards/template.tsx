import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import ControlCard, { ControlCardProps } from './controlcard'

export interface ControlTemplateProps {
    head: React.ReactNode,
    body: React.ReactNode,
}
export default function ControlTemplate({ head, body }: ControlTemplateProps) {
    return (
        <>
        <Row>
            <Col>
                {head}
            </Col>
        </Row>
        <Row>
                <Col>
                    {body}
                </Col>
        </Row>
            </>
    )
}
