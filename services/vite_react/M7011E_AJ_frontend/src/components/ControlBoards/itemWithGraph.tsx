import React from 'react'
import { Col, Row } from 'react-bootstrap'
import ValueOverTime from '../GraphComponents/ValueOverTime'

export interface ItemWithGraphProps {
    value: number,
    valueTitle: string,
    data: { timestamp: number, value: number }[]
}

export default function ItemWithGraph({ value, data, valueTitle }: ItemWithGraphProps) {
    return (
        <>
            <span>
                <Row>
                    <Col>
                        {valueTitle}
                    </Col>
                    <Col>
                        {value}
                    </Col>
                    <Col xs={8}>
                    <ValueOverTime data={data} xaxis="t" yaxis={valueTitle} />
                    </Col>
                </Row>
            </span>
        </>
    )
}
