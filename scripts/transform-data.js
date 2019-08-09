const fs = require('fs')
const path = require('path')
const d3 = require('d3')
const tz = require('timezone')
const berlinTimeZoneDefinitions = require('timezone/Europe/Berlin')
const berlinTime = tz(berlinTimeZoneDefinitions, 'Europe/Berlin')

function parseDWDDate (string, timezone) {
  const year = string.substring(0, 4)
  const month = string.substring(4, 6)
  const day = string.substring(6, 8)
  const hour = string.substring(8, 10)

  // we parse the date assuming it is in utc
  // the metadata claims that sometimes (depending on the date) it is not
  // but at least the temperature values are more plausible if we read them in utc
  // for things like wind speed or rain this is obviously harder to say
  return tz([year, month, day, hour])
}

// const rawDaylyData = fs.readFileSync(path.join(__dirname, '../data/produkt_klima_tag_19500101_20181231_02812.txt'), 'utf8')
const rawHourlyTemperatureData = fs.readFileSync(path.join(__dirname, '../data/produkt_tu_stunde_19500101_20181231_02812.txt'), 'utf8')
const rawHourlyWindData = fs.readFileSync(path.join(__dirname, '../data/produkt_ff_stunde_19500101_20181231_02812.txt'), 'utf8')
const rawHourlyRainData = fs.readFileSync(path.join(__dirname, '../data/produkt_rr_stunde_19500101_20181231_02812.txt'), 'utf8')
const rawHourlySunshineData = fs.readFileSync(path.join(__dirname, '../data/produkt_sd_stunde_19500101_20181231_02812.txt'), 'utf8')

const parser = d3.dsvFormat(';')
// const daylyData = parser.parse(rawDaylyData)

let juli31hourlyValues = parser.parse(rawHourlyTemperatureData)
  .map(row => ({
    temperature: parseFloat(row.TT_TU),
    timestamp: parseDWDDate(row.MESS_DATUM)
  }))
  .filter(row => berlinTime(row.timestamp, '%d.%m') === '31.07')
  .reduce((obj, row) => {
    obj[row.timestamp] = { temperature: row.temperature, date: new Date(row.timestamp).toISOString() }
    return obj
  }, {})

parser.parse(rawHourlyWindData).forEach(row => {
  const timestamp = parseDWDDate(row.MESS_DATUM)
  if (!juli31hourlyValues[timestamp]) return

  juli31hourlyValues[timestamp] = { ...juli31hourlyValues[timestamp], windSpeed: row['   F'] }
})

parser.parse(rawHourlyRainData).forEach(row => {
  const timestamp = parseDWDDate(row.MESS_DATUM)
  if (!juli31hourlyValues[timestamp]) return

  juli31hourlyValues[timestamp] = { ...juli31hourlyValues[timestamp], rain: row['  R1'] }
})

parser.parse(rawHourlySunshineData).forEach(row => {
  const timestamp = parseDWDDate(row.MESS_DATUM)
  if (!juli31hourlyValues[timestamp]) return

  juli31hourlyValues[timestamp] = { ...juli31hourlyValues[timestamp], sunshine: row['SD_SO'] }
})

const csv = d3.csvFormat(Object.values(juli31hourlyValues))

fs.writeFileSync(path.join(__dirname, '../public/data.csv'), csv, 'utf8')
// fs.writeFileSync(path.join(__dirname, '../public/nodes.csv'), formatedNodes, 'utf8')
console.log('ok')