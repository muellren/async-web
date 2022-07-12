import express, { response } from 'express'
import http from 'http'
const app = express()
const port = 3000

app.use(express.static('public'))

app.get('/discount', (req, res) => {
  const score = parseInt(req.query['score'])
  const numOrders = parseInt(req.query['orders'])
  const totals = parseFloat(req.query['totals'])
  const firstOrderDate = req.query['first_order_date']
  const MIN_ORDERS = 5
  const MAX_DISCOUNT = 0.10

  const daysSinceFirstOrder = Math.max(Math.ceil((Date.now() - Date.parse(firstOrderDate)) / (1e3 * 3600 * 24)), 0)
  const avgDailyOrderAmount = totals / daysSinceFirstOrder * Math.min(numOrders, MIN_ORDERS) / MIN_ORDERS

  let discount = (score / 100) * Math.min(avgDailyOrderAmount / 100.0, 1) * MAX_DISCOUNT
  if (Number.isNaN(discount)) {
    discount = 0.0
  }
  res.send({'discount': discount})
})

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, resp => {
      const statusCode = resp.statusCode
      const contentType = resp.headers['content-type']

      if (statusCode != 200) {
        reject(new Error(`Request failed. Status code: ${statusCode}`))
      } else if (!/^application\/json/.test(contentType)) {
        reject(new Error(`Invalid content type: ${contentType}, expected application/json`))
      }
      resp.setEncoding('utf8')
      let rawData = ''
      resp.on('data', chunk => {
        rawData += chunk
      })
      resp.on('end', () => {
        try {
          const json = JSON.parse(rawData)
          resolve(json)
        } catch (e) {
          reject(new Error(`Error while parsing JSON: ${e.message}`))
        }
      })
    })
  })
}

app.get('/user/:userId', (req, res) => {
  const userId = req.params['userId']
  fetchJson(`http://localhost:4000/user/${userId}`)
  .then(json => res.send(json))
  .catch(err => {throw err})
})

app.get('/orders', (req, res) => {
  const userId = parseInt(req.query['by'])
  const limit = parseInt(req.query['limit'])
  fetchJson(`http://localhost:4000/orders?by=${userId}&limit=${limit}`)
  .then(json => res.send(json))
  .catch(err => {throw err})
})

app.listen(port, () => {
  console.log(`Discount service listening on port ${port}`)
})
