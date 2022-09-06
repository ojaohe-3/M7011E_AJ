import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import Manager from '../../models/Manager'
import Prosumer from '../../models/Prosumer'
import { Privilage } from '../../models/userdata'
import WindmillIcon from '../../public/image/turbine.png'


export interface ItemForMemberProps {
    privilege: Privilage
}

export default function ItemForMember({ privilege }: ItemForMemberProps) {
    const [item, setItem] = useState<Prosumer | Manager | undefined>(undefined);

    return (
        <>
            <Row>
                <Col xs={4}>
                    <img src={WindmillIcon} />
                </Col>
                <Col xs={8}>
                    <Row>
                        <Col>
                            <h5>
                                Access level:
                            </h5>
                        </Col>
                        <Col>
                            <p>
                                {privilege.level}
                            </p>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    )
}
