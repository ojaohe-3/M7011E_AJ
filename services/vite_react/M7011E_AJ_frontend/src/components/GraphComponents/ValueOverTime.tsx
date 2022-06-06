import React from 'react'

export interface ValueOverTimeProp{
    data: {timestamp: number, value: number}[]
    xaxis: string
    yaxis: string
}

export default function ValueOverTime({data, xaxis, yaxis} : ValueOverTimeProp) {
  return (
    <div>ValueOverTime</div>
  )
}
