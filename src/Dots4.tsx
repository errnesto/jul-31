import React from 'react'
import Chroma from 'chroma-js'
import { interpolateSpectral } from 'd3-scale-chromatic'

const dayNight = Chroma.scale(['#0d0887', '#bb3488', '#dd5e66', '#fdc327']).domain([0, 0.2, 0.3, 1])

type Props = {
  hourlyData: Array<{ hour: number, line: number, temperature: number }>
}
const Dots: React.FC<Props> = (props) => {
  const { hourlyData } = props

  const dotSize = 45
  return <svg viewBox={`0 0 ${dotSize * 24 + dotSize / 2} ${dotSize * 27}`} width='100%' height='100%'>
    {hourlyData.map((v, i) => {
      const isEvenLine = v.line % 2 === 0

      const unshiftedX = v.hour * dotSize + dotSize / 2
      const x = isEvenLine ? unshiftedX : unshiftedX + dotSize / 2
      const y = dotSize * v.line + dotSize / 2
      const r = Math.sqrt(v.line) * 4

      return <circle
        key={i}
        cx={x}
        cy={y}
        r={r}
        stroke={'#aaa'}
        fill={interpolateSpectral(1 - ((v.temperature - 10) / 25))}/>
    })}
  </svg>
}

export default Dots
