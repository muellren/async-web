"use strict"

const userId = 1234567
const limit = 5
const userRequest = `http://localhost:3000/user/${userId}`
const orderRequest = `http://localhost:3000/orders?by=${userId}&limit=${limit}`
const prefixDiscountRequest = 'http://localhost:3000/discount'

function fetchJson(url, resultCallback, errorCallback) {
  fetch(url
  ).then(resp => {
    if (!resp.ok) {
      errorCallback(new Error(`Request failed. Status code: ${resp.status}`))
      return
    }
    resp.json()
      .then(resultCallback)
      .catch(e => errorCallback(new Error(`Error while parsing JSON: ${e.message}`)))
  }).catch(errorCallback)
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
      const out = `discount for user ${userId}: ${discount}`
      console.log(out)

      const root = document.getElementById("root")
      const text = document.createTextNode(out)
      root.appendChild(text)
    }, errorHandler('Discount Request'))
  }, errorHandler('Order Request'))
}, errorHandler('User Request'))
