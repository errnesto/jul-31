const fs = require('fs')
const path = require('path')
const d3 = require('d3')
const tz = require('timezone')
const berlinTimeZoneDefinitions = require('timezone/Europe/Berlin')
const berlinTime = tz(berlinTimeZoneDefinitions, 'Europe/Berlin')

const rawDaylyData = fs.readFileSync(path.join(__dirname, '../data/produkt_klima_tag_19500101_20181231_02812.txt'), 'utf8')
const rawHourlyData = fs.readFileSync(path.join(__dirname, '../data/produkt_tu_stunde_19500101_20181231_02812.txt'), 'utf8')


const parser = d3.dsvFormat(';')
const daylyData = parser.parse(rawDaylyData)
const hourlyData = parser.parse(rawHourlyData)

const juli31hourlyTemperatures = hourlyData
  .map(row => {
    const temperature = parseFloat(row.TT_TU)
    const year = row.MESS_DATUM.substring(0, 4)
    const month = row.MESS_DATUM.substring(4, 6)
    const day = row.MESS_DATUM.substring(6, 8)
    const hour = row.MESS_DATUM.substring(8, 10)
    // i like to use timezone so i know this is parsed in the correct timzone
    // and don't have to hope my computer is set up currectly
    const date = berlinTime([year, month, day, hour])
    return { date, temperature }
  })
  .filter(row => berlinTime(row.date, '%d.%m') === '31.07')
  .map(row => ({ ...row, date: new Date(row.date) }))

const csv = d3.csvFormat(juli31hourlyTemperatures)

fs.writeFileSync(path.join(__dirname, '../public/data.csv'), csv, 'utf8')
// fs.writeFileSync(path.join(__dirname, '../public/nodes.csv'), formatedNodes, 'utf8')
console.log('ok')