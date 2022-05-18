import React, { useState } from 'react'
import { Row } from 'react-bootstrap'
import { Container } from 'react-bootstrap/lib/Tab'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { bindActionCreators } from 'redux'
import Manager from '../../../models/Manager'
import { ActionCreators } from '../../../redux/actions'
import { State } from '../../../redux/reducers'
import ControlTemplate from '../template'
import ManagerBody from './body'
import ManagerHeader from './header'

export default function ManagerControlComponent() {
  const dispatch = useDispatch();
  const action = bindActionCreators(ActionCreators, dispatch)
  const user = useSelector((state: State) => state.user);
  
  return (
    <ControlTemplate head={<ManagerBody />} body={<ManagerHeader />} />
  )
}
