"use strict"

const http = require("http")

const userId = 1234567
const limit = 5
const userRequest = `http://localhost:4000/user/${userId}`
const orderRequest = `http://localhost:4000/orders?by=${userId}&limit=${limit}`
const prefixDiscountRequest = 'http://localhost:3000/discount'


function fetchJson(url, resultCallback, errorCallback) {
  http.get(url, res => {
    const { statusCode } = res
    const contentType = res.headers['content-type']

    let error
    if (statusCode != 200) {
      error = new Error(`Request failed. Status code: ${statusCode}`)
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error(`Invalid content type: ${contentType}, expected application/json`)
    }
    if (error) {
      errorCallback(error)
      res.resume()
      return
    }

    res.setEncoding('utf8')
    let rawData = ''

    res.on('data', chunk => {
      rawData += chunk
    })
    res.on('end', () => {
      try {
        const json = JSON.parse(rawData)
        resultCallback(json)
      } catch (e) {
        errorCallback(new Error(`Error while parsing JSON: ${e.message}`))
      }
    })
  }).on('error', err => {
     errorCallback(new Error(`Request failed: ${err.message}`))
  })
}

function discountRequestUrl(score, limit, orderTotals, firstOrderDate) {
  return prefixDiscountRequest +
        `?score=${score}&orders=${limit}&totals=${orderTotals}&first_order_date=${firstOrderDate}`
}

// curried error handler
const errorHandler = req => err => console.log(`${req}: ${err}`)

// nested requests using callbacks
fetchJson(userRequest, userJson => {
  fetchJson(orderRequest, orderJson => {
    const score = userJson.score
    const firstOrderDate = orderJson.last_orders[0].order_date
    const orderTotals = orderJson.last_orders.reduce(
      (agg, cur) => agg + cur.total, 0)

    fetchJson(discountRequestUrl(score, limit, orderTotals, firstOrderDate),
          discountJson => {
      const discount = discountJson.discount
      console.log(`discount for user ${userId}: ${discount}`)

    }, errorHandler('Discount Request'))
  }, errorHandler('Order Request'))
}, errorHandler('User Request'))
