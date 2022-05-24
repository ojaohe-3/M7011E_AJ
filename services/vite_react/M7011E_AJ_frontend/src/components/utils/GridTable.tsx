import React, { CSSProperties } from 'react'
import '../../public/style/grid.css'


export interface GridTable {
  Body: any | React.FC 
  Head: any | React.FC 
  Item: any | React.FC 
  Foot: any | React.FC 

}

interface Props {
  children?: React.ReactNode |  React.ReactNode [] | any
  style?: CSSProperties
}
// TODO:
interface HeadProps extends Props {

}
interface ItemProps extends Props {

}
interface FootProps extends Props {

}
// ======

const Body: React.FC  = ({ children, style }: any) => {
  return (
    <div style={style} className="grid">
      {children}
    </div>
  )
}

const Head: React.FC  = ({ children, style }: any) => {
  return (
    <div style={style} className="grid-head">
      {children}
    </div>
  )
}


const Item: React.FC  = ({ children, style }: any) => {
  return (
    <div style={style} className="grid-item">{children}</div>
  )
}


const Foot: React.FC  = ({ children, style }: any) => {
  return (
    <div style={style} className="grid-foot">{children}</div>
  )
}

export default { Body, Head, Item, Foot } as GridTable