import React from 'react'
import Chroma from 'chroma-js'
import { interpolateRdPu } from 'd3-scale-chromatic'

const dayNight = Chroma.scale(['#f7cf00', '#2c69a1'])

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
  return <svg viewBox={`0 0 ${dotSize * 24 + dotSize / 2} ${dotSize * 28}`} width='100%' height='100%'>
    <defs>
      {windSpeeds.map(speed =>
        <filter id={`wind${speed}`} x='0%' y='0%' width='100' height='100'>
          <feTurbulence type='turbulence' baseFrequency='0.0 0.5' result='NOISE' numOctaves='5' />
          <feDisplacementMap in='SourceGraphic' in2='NOISE' scale={speed * 2} xChannelSelector='R' yChannelSelector='R'></feDisplacementMap>
        </filter>
      )}
      {rainHeights.map(height =>
        <filter id={`rain${height}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in='SourceGraphic' stdDeviation={height} />
        </filter>
      )}
    </defs>
    {hourlyData.map((v, i) => {
      const isEvenLine = v.line % 2 === 0

      const windSpeed = Math.floor(v.windSpeed)
      const rainHeight = Math.round(v.rain || 0)
      const sunshine = isNaN(v.sunshine) ? 0 : v.sunshine + 20
      const windFilter = windSpeed === 0 ? '' : `url(#wind${windSpeed})`
      const rainFilter = rainHeight === 0 ? '' : `url(#rain${rainHeight})`
      const unshiftedX = v.hour * dotSize + dotSize / 2
      const x = isEvenLine ? unshiftedX : unshiftedX + dotSize / 2
      const y = dotSize * 0.9 * v.line + dotSize / 2
      const r = v.temperature * 0.6

      if (isNaN(r)) {
        return <rect
          x={x}
          y={y - 8}
          width='15'
          height='15'
          transform={`rotate(45, ${x}, ${y - 8})`}
          fill={interpolateRdPu(1.5 - (sunshine / 80 + 0.5) / 1.5)}
          filter={windFilter}
         />
      }

      return <g filter={rainFilter}>
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          overflow='visible'
          fill={interpolateRdPu(1.5 - (sunshine / 80 + 0.5) / 1.5)}
          filter={windFilter} />
      </g>
    })}
  </svg>
}

export default Dots
