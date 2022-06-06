import React from 'react';
import { CloseButton, ModalBody, Modal, ModalFooter } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/esm/ModalHeader';

interface PopupTemplateProps {
    head?: React.ReactNode 
    body?: React.ReactNode 
    footer?: React.ReactNode 
    show: boolean
    onClose: (e: any) => void
    size?: 'sm' | 'lg' | 'xl'
}

const PopupTemplate: React.FC<PopupTemplateProps> = (props: PopupTemplateProps) => {
    return (
        <>
            <Modal size={props.size} show={props.show}>
                <Modal.Header>
                    {props.head}
                    <CloseButton onClick={props.onClose} />
                </Modal.Header>
                <Modal.Body>
                    {props.body}
                </Modal.Body>
                <Modal.Footer>
                    {props.footer}
                </Modal.Footer>
            </Modal>
        </>
    );
};
export default PopupTemplate;
