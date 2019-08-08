import React from 'react'
import { interpolateViridis } from 'd3-scale-chromatic'

type Props = {
  hourlyData: Array<{ hour: number, line: number, temperature: number }>
}
const Dots: React.FC<Props> = (props) => {
  const { hourlyData } = props

  const dotSize = 40
  return <svg viewBox={`0 0 ${dotSize * 24 + dotSize / 2} ${dotSize * 27}`} width='100%' height='100%'>
    {hourlyData.map((v, i) => {
      const isEvenLine = v.line % 2 === 0

      const unshiftedX = v.hour * dotSize + dotSize / 2
      const x = isEvenLine ? unshiftedX : unshiftedX + dotSize / 2
      const y = dotSize * v.line + dotSize / 2
      const r = v.temperature * 0.7

      return <circle
        key={i}
        cx={x}
        cy={y}
        r={r}
        fill={interpolateViridis((v.temperature - 10) / 25)}/>
    })}
  </svg>
}

export default Dots
