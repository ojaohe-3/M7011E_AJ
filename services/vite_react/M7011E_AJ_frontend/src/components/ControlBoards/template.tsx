import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import GridTable from '../utils/GridTable'
import ControlCard, { ControlCardProps } from './controlcard'

export interface ControlTemplateProps {
    head: React.ReactNode,
    children?: JSX.Element | JSX.Element[]
}
export default function ControlTemplate({ head, children }: ControlTemplateProps) {
    
    return (
        <>
            <GridTable.Body>
                <GridTable.Head>
                    {head}
                </GridTable.Head>
                <GridTable.Item>
                    {children}
                </GridTable.Item>
            </GridTable.Body>
        </>
    )
}
