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
  const hour = string.substring(8, 10) || 0

  // we parse the date assuming it is in utc
  // the metadata claims that sometimes (depending on the date) it is not
  // but at least the temperature values are more plausible if we read them in utc
  // for things like wind speed or rain this is obviously harder to say
  return tz([year, month, day, hour])
}

// const rawDaylyTemperatureData = fs.readFileSync(path.join(__dirname, '../data/produkt_klima_tag_19500101_20181231_02812.txt'), 'utf8')

const rawHourlyTemperatureData = fs.readFileSync(path.join(__dirname, '../data/produkt_tu_stunde_19500101_20181231_02812.txt'), 'utf8')
const rawHourlyTemperatureDataNew = fs.readFileSync(path.join(__dirname, '../data/produkt_tu_stunde_20180209_20190812_02812.txt'), 'utf8')
const rawHourlyWindData = fs.readFileSync(path.join(__dirname, '../data/produkt_ff_stunde_19500101_20181231_02812.txt'), 'utf8')
const rawHourlyWindDataNew = fs.readFileSync(path.join(__dirname, '../data/produkt_ff_stunde_20180209_20190812_02812.txt'), 'utf8')
const rawHourlyRainData = fs.readFileSync(path.join(__dirname, '../data/produkt_rr_stunde_19500101_20181231_02812.txt'), 'utf8')
const rawHourlyRainDataNew = fs.readFileSync(path.join(__dirname, '../data/produkt_rr_stunde_20180209_20190812_02812.txt'), 'utf8')
const rawHourlySunshineData = fs.readFileSync(path.join(__dirname, '../data/produkt_sd_stunde_19500101_20181231_02812.txt'), 'utf8')
const rawHourlySunshineDataNew = fs.readFileSync(path.join(__dirname, '../data/produkt_sd_stunde_20180209_20190812_02812.txt'), 'utf8')

const parser = d3.dsvFormat(';')

// const juli31DayliValues = parser.parse(rawDaylyTemperatureData)
//   .map(row => ({
//     temperature: parseFloat(row[' TMK']),
//     timestamp: parseDWDDate(row.MESS_DATUM)
//   }))
//   // TODO create fake hourly data based on hour
//   // we also have TN as min temperature and TX as max temperature
//   // if we want to do fancy stuff
//   .filter(row => {
//     const year = +berlinTime(row.timestamp, '%Y')
//     return year >= '1992' && year < 1995
//   })
//   .filter(row => berlinTime(row.timestamp, '%d.%m') === '31.07')

const juli31hourlyValues =
  [...parser.parse(rawHourlyTemperatureData), ...parser.parse(rawHourlyTemperatureDataNew)]
  .map(row => ({
    temperature: parseFloat(row.TT_TU),
    timestamp: parseDWDDate(row.MESS_DATUM)
  }))
  .filter(row => berlinTime(row.timestamp, '%d.%m') === '31.07')

const emptyDatasets = [
  ...Array(24).fill(null).map((_, i) => ({ timestamp: tz([1992, 7, 31, i]) })),
  ...Array(24).fill(null).map((_, i) => ({ timestamp: tz([1993, 7, 31, i]) })),
  ...Array(24).fill(null).map((_, i) => ({ timestamp: tz([1994, 7, 31, i]) }))
]

console.log(emptyDatasets)

let alljuli31Values = [...emptyDatasets, ...juli31hourlyValues]
  .reduce((obj, row) => {
    obj[row.timestamp] = { temperature: row.temperature, date: new Date(row.timestamp).toISOString() }
    return obj
  }, {})

const joinedWindData = [...parser.parse(rawHourlyWindData), ...parser.parse(rawHourlyWindDataNew)]
joinedWindData.forEach(row => {
  const timestamp = parseDWDDate(row.MESS_DATUM)
  if (!alljuli31Values[timestamp]) return

  alljuli31Values[timestamp] = { ...alljuli31Values[timestamp], windSpeed: row['   F'] }
})

const joinedRainData = [...parser.parse(rawHourlyRainData), ...parser.parse(rawHourlyRainDataNew)]
joinedRainData.forEach(row => {
  const timestamp = parseDWDDate(row.MESS_DATUM)
  if (!alljuli31Values[timestamp]) return

  alljuli31Values[timestamp] = { ...alljuli31Values[timestamp], rain: row['  R1'] }
})

const joinedSunshineData = [...parser.parse(rawHourlySunshineData), ...parser.parse(rawHourlySunshineDataNew)]
joinedSunshineData.forEach(row => {
  const timestamp = parseDWDDate(row.MESS_DATUM)
  if (!alljuli31Values[timestamp]) return

  alljuli31Values[timestamp] = { ...alljuli31Values[timestamp], sunshine: row['SD_SO'] }
})

const csv = d3.csvFormat(Object.values(alljuli31Values))

fs.writeFileSync(path.join(__dirname, '../public/data.csv'), csv, 'utf8')
// fs.writeFileSync(path.join(__dirname, '../public/nodes.csv'), formatedNodes, 'utf8')
console.log('ok')