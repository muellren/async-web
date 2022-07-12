"use strict"

const http = require("http")


const userId = 1234567
const limit = 5
const userRequest = `http://localhost:4000/user/${userId}`
const orderRequest = `http://localhost:4000/orders?by=${userId}&limit=${limit}`
const prefixDiscountRequest = 'http://localhost:3000/discount'

function fetchJson(url) {
  return new Promise((resolve, reject) => {
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
        res.resume()
        reject(error)
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
          resolve(json)
        } catch (e) {
          reject(new Error(`Error while parsing JSON: ${e.message}`))
        }
      })
    }).on('error', err => {
      reject(new Error(`Request failed: ${err.message}`))
    })
  })
}

function discountRequestUrl(score, limit, orderTotals, firstOrder) {
  return prefixDiscountRequest +
        `?score=${score}&orders=${limit}&totals=${orderTotals}&first_order_date=${firstOrder}`
}

// requests through Promises, user and order requests made sequentially
const promiseUser = fetchJson(userRequest)
const promiseOrder = promiseUser.then(_user=> fetchJson(orderRequest))
Promise.all([promiseUser, promiseOrder])
  .then(([user, orders]) => {
    const score = user.score
    const firstOrderDate = orders.last_orders[0].order_date
    const orderTotals = orders.last_orders.reduce(
      (agg, cur) => agg + cur.total, 0)
    return fetchJson(discountRequestUrl(score, limit, orderTotals, firstOrderDate))
  })
  .then(result => console.log(`discount for user ${userId}: ${result.discount}`))
  .catch(err => { console.log(err)})


// requests through Promises, user and order requests made concurrently
Promise.all([fetchJson(userRequest), fetchJson(orderRequest)])
  .then(([user, orders]) => {
    const score = user.score
    const firstOrderDate = orders.last_orders[0].order_date
    const orderTotals = orders.last_orders.reduce(
      (agg, cur) => agg + cur.total, 0)
    return fetchJson(discountRequestUrl(score, limit, orderTotals, firstOrderDate))
  })
  .then(result => console.log(`discount for user ${userId}: ${result.discount}`))
  .catch(err => { console.log(err)})
