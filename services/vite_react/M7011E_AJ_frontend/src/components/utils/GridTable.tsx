import React, { CSSProperties } from 'react'
import '../../public/style/grid.css'


export interface GridTable {
  Body: () => JSX.Element
  Head: () => JSX.Element
  Item: () => JSX.Element
  Foot: () => JSX.Element

}

interface Props {
  child?: JSX.Element | JSX.Element[]
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

const Body = ({ child, style }: Props) => {
  return (
    <div style={style} className="grid">
      {child}
    </div>
  )
}

const Head = ({ child, style }: HeadProps) => {
  return (
    <div style={style} className="grid-head">
      {child}
    </div>
  )
}


const Item = ({ child, style }: ItemProps) => {
  return (
    <div style={style} className="grid-item">{child}</div>
  )
}


const Foot = ({ child, style }: FootProps) => {
  return (
    <div style={style} className="grid-foot">{child}</div>
  )
}

export default { Body, Head, Item, Foot } as GridTable