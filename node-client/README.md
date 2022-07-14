# Asynchronous JavaScript from Node.js

## Callbacks

Callbacks are function that get called when the asynchronous operation completes,
either successfully or with failure.

[client-callback.js](client-callback.js):

```javascript
// curried error handler
const errorHandler = req => err => console.log(`${req}: ${err}`)

// nested requests using callbacks
fetchJson(userRequest, userJson => {
  fetchJson(orderRequest, orderJson => {
    const score = userJson.score
    const firstOrderDate = orderJson.last_orders[0].order_date
    const orderTotals = orderJson.last_orders.reduce(
      (agg, cur) => agg + cur.total, 0)

    fetchJson(discountRequestUrl(score, limit, orderTotals,
                                firstOrderDate),
          discountJson => {
      const discount = discountJson.discount
      console.log(`discount for user ${userId}: ${discount}`)

    }, errorHandler('Discount Request'))
  }, errorHandler('Order Request'))
}, errorHandler('User Request'))
```

**Note:** that the user and the order requests
are issued serially although there is no dependency between
the two requests. The requests could be made concurrently.

Nesting of callback typically results in illegible code.
This is also known as the *callback hell*.

## Promises

Promises are objects that produce a value in the future.
They are said to complete in the future. They **resolve** to a value if they
complete successfully, or alteratively, **reject** if there is an error.
Promises, i.e., references to promise instances, can be passed freely around. They can be returned from function and a passed as arguments to other functions.
Callback functions can be registered with promises. They called when the
promise completes.

[client-promises.js](client-promises.js):

```javascript
// requests through Promises, user and order requests made concurrently
Promise.all([fetchJson(userRequest), fetchJson(orderRequest)])
  .then(([user, orders]) => {
    const score = user.score
    const firstOrderDate = orders.last_orders[0].order_date
    const orderTotals = orders.last_orders.reduce(
      (agg, cur) => agg + cur.total, 0)
    return fetchJson(discountRequestUrl(score, limit, orderTotals,
                                        firstOrderDate))
  }).then(result => console.log(
    `discount for user ${userId}: ${result.discount}`)
  ).catch(err => { console.log(err)})
```

Promises can be chained through `then`. In this example, the user and
order requests processed simultaneously.

## Async/Await

Asynchronous functions and await improve the readability of the code.
It does away with the parentheses hell of callbacks and improves the code
legibility over Promises. Async functions are based on generator functions
that yield Promises.

[client-async.js](client-async.js):

```javascript
// async function, user and order requests made concurrently
async function getDiscount() {
  const [user, orders] = await Promise.all(
    [fetchJson(userRequest), fetchJson(orderRequest)])

  const score = user.score
  const firstOrderDate = orders.last_orders[0].order_date
  const orderTotals = orders.last_orders.reduce(
    (agg, cur) => agg + cur.total, 0)

  const result = await fetchJson(discountRequestUrl(score, limit,
                          orderTotals, firstOrderDate))
  return result.discount
}

getDiscount()
  .then(discount => console.log(
    `discount for user ${userId}: ${discount}`))
  .catch(err => console.log(err))
```
