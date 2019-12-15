import React from 'react'
import Chroma from 'chroma-js'
import { interpolateRdPu } from 'd3-scale-chromatic'

const dayNight = Chroma.scale(['#f26f2a', '#ff9471', '#cccb4e', '#9fc9c2'])

type Props = {
  hourlyData: Array<{
    hour: number,
    line: number,
    temperature: number,
    windSpeed: number,
    rain: number,
    sunshine: number
  }>
}
const Dots: React.FC<Props> = (props) => {
  const { hourlyData } = props

  const windSpeeds = Array.from(new Set(hourlyData
    .map(row => Math.floor(row.windSpeed))
    .filter(speed => speed !== 0)
  ))

  const rainHeights = Array.from(new Set(hourlyData
    .map(row => Math.round(row.rain || 0))
    .filter(rain => rain !== 0)
  ))

  const dotSize = 45
  return <svg viewBox={`0 0 ${dotSize * 28 * 0.9 + dotSize / 2} ${dotSize * 28}`} width='100%' height='100%' version="1.1" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {windSpeeds.map(speed =>
        <filter id={`wind${speed}`} x='0%' y='0%' width='100' height='100'>
          <feTurbulence type='turbulence' baseFrequency='0.0 0.5' result='NOISE' numOctaves='5' />
          <feDisplacementMap in='SourceGraphic' in2='NOISE' scale={speed * 2.5} xChannelSelector='R' yChannelSelector='R'></feDisplacementMap>
        </filter>
      )}
      {rainHeights.map(height =>
        <filter id={`rain${height}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in='SourceGraphic' stdDeviation={height} />
        </filter>
      )}
    </defs>
    {hourlyData.map((v, i) => {
      const isEvenRow = i % 2 === 0

      const windSpeed = Math.floor(v.windSpeed)
      const rainHeight = Math.round(v.rain || 0)
      const sunshine = isNaN(v.sunshine) ? 0 : v.sunshine + 20
      const windFilter = windSpeed === 0 ? '' : `url(#wind${windSpeed})`
      const rainFilter = rainHeight === 0 ? '' : `url(#rain${rainHeight})`
      const unshifted = v.hour * dotSize + dotSize / 2
      const y = (23 - v.hour) * dotSize + dotSize / 2
      const x = isEvenRow
        ? dotSize * v.line * 0.9 + dotSize / 2
        : dotSize * v.line * 0.9 + dotSize / 2 + dotSize / 2
      const r = v.temperature * 0.6

      if (isNaN(r)) {
        return <g filter={windFilter}><rect
          x={x}
          y={y - 8}
          width='15'
          height='15'
          transform={`rotate(45, ${x}, ${y - 8})`}
          fill={interpolateRdPu(1.5 - (sunshine / 80 + 0.5) / 1.5)}
         /></g>
      }

      return <g filter={rainFilter}>
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          overflow='visible'
          fill={interpolateRdPu(1.5 - (sunshine / 80 + 0.5) / 1.5)}
          // fill={dayNight(1 - (sunshine / 80)).hex()}
          filter={windFilter} />
      </g>
    })}
  </svg>
}

export default Dots
