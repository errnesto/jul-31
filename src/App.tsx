import React, { useEffect, useState } from 'react'
import { csvParse } from 'd3'
const tz = require('timezone')
const berlinTimeZoneDefinitions = require('timezone/Europe/Berlin')
const berlinTime = tz(berlinTimeZoneDefinitions, 'Europe/Berlin')



const App: React.FC = () => {
  const inital: Array<{ date: Date, temperature: number }> = []
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

  return <>
    {temperatures.map(row => <p>{row.date} || {berlinTime(row.date, '%y %m %d -- %H')}, {row.temperature}</p>)}
  </>
}

export default App
