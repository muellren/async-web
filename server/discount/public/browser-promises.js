"use strict"

const userId = 1234567
const limit = 5
const userRequest = `http://localhost:3000/user/${userId}`
const orderRequest = `http://localhost:3000/orders?by=${userId}&limit=${limit}`
const prefixDiscountRequest = 'http://localhost:3000/discount'

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    fetch(url
      ).then(resp => {
        if (!resp.ok) {
          reject(new Error(`Request failed. Status code: ${resp.status}`))
          return
        }
        resp.json()
          .then(obj => resolve(obj))
          .catch(e => reject(new Error(`Error while parsing JSON: ${e.message}`)))
      }).catch(reject)
  })
}


function discountRequestUrl(score, limit, orderTotals, firstOrder) {
  return prefixDiscountRequest +
        `?score=${score}&orders=${limit}&totals=${orderTotals}&first_order_date=${firstOrder}`
}

// requests through Promises, user and order requests made concurrenly
Promise.all([fetchJson(userRequest), fetchJson(orderRequest)])
  .then(([user, orders]) => {
    const score = user.score
    const firstOrderDate = orders.last_orders[0].order_date
    const orderTotals = orders.last_orders.reduce(
      (agg, cur) => agg + cur.total, 0)
    return fetchJson(discountRequestUrl(score, limit, orderTotals, firstOrderDate))
  })
  .then(result => {
    const out = `discount for user ${userId}: ${result.discount}`
    console.log(out)
    const root = document.getElementById("root")
    const text = document.createTextNode(out)
    root.appendChild(text)
  })
  .catch(err => { console.log('x' + err)})
