import React, { useEffect, useState } from 'react'
import { csvParse } from 'd3'
import Dots from 'Dots'
import Dots2 from 'Dots2'
import Dots3 from 'Dots3'
import Dots4 from 'Dots4'

const tz = require('timezone')
const berlinTimeZoneDefinitions = require('timezone/Europe/Berlin')
const berlinTime = tz(berlinTimeZoneDefinitions, 'Europe/Berlin')



const App: React.FC = () => {
  const inital: Array<{ date: string, temperature: string, windSpeed: string, rain: string, sunshine: string }> = []
  const [temperatures, setTemperatures] = useState(inital)

  useEffect(() => {
    async function fetchData () {
      const res = await fetch('./data.csv')
      const text = await res.text()
      const data: any = csvParse(text)

      setTemperatures(data)
    }
    fetchData()
  }, [])

  const hourlyData = temperatures.map(row => ({
    hour: +berlinTime(row.date, '%H'),
    line: +berlinTime(row.date, '%Y') - 1992,
    windSpeed: parseFloat(row.windSpeed),
    rain: parseFloat(row.rain),
    temperature: parseFloat(row.temperature),
    sunshine: parseFloat(row.sunshine)
  }))

  return <Dots hourlyData={hourlyData} />
}

export default App
