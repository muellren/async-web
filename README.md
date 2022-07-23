# Asynchronous Web Requests

- [C# Client](cs-client/)
- [Kotlin Client](kotlin-client/)
- [JavaScript Client](node-client/)
- [Python Client](python-client/)
- [Rust Client](rust-client/)

## Backend Services

The application consists of two server services:
the Shop service in Python `flask` service, and Discount service in Node.js `express`.

### Shop Service (flask)

#### User API

```text
http://127.0.0.1:4000/user/<userid>
````

```console
$ curl http://127.0.0.1:4000/user/12345
{
  "city": "West Lindsey",
  "dob": "1989-01-05",
  "email": "yrusso@example.net",
  "joined": "2018-07-27",
  "name": "Kristi West",
  "score": 55,
  "state": "Washington",
  "street": "4505 Leslie Estates Apt. 145",
  "userid": 12345,
  "zip": 20267
}
```

#### Last Orders API

```text
http://127.0.0.1:4000/orders?by=<userid>&limit=<maxNumReturnedOrders>
````

```console
$ curl http://127.0.0.1:4000/orders\?by\=12345\&limit\=2
{
  "last_orders": [
    {
      "order_date": "2022-05-17",
      "total": 6766.11
    },
    {
      "order_date": "2022-05-19",
      "total": 2999.44
    }
  ]
}
```

### Discount Service (express)

#### Discount API

```text
Format:  http://127.0.0.1:3000/discount\?score\=100\&orders\=5\&totals\=12345.33\&first_order_date\=2022-01-01
```

```console
$ curl \
  http://127.0.0.1:3000/discount\?score\=100\&orders\=5\&totals\=12345.33\&first_order_date\=2022-01-01
{"discount":0.06429859375000001}%
```

### Proxied User and Orders Services (express)

Due to CORS restrictions for browser clients, the User and Orders services
are proxied by the express service. This service also servers
the static content for the browser applications.

## Start the Backend Services

### Start Shop Service

Start flask on port 4000:

```console
$ cd server/shop
$ export FLASK_APP=shop
$ export FLASK_ENV=development
$ python -m flask  run --host=0.0.0.0 --port 4000
* Serving Flask app 'shop' (lazy loading)
* Environment: product
* Debug mode: off
* Running on all addresses (0.0.0.0)
  WARNING: This is a development server. Do not use it in a production deployment.
* Running on http://127.0.0.1:4000
* Running on http://192.168.1.131:4000 (Press CTRL+C to quit)
```

### Start the Discount Service and the serving of static content

Start express on port 3000:

```console
$ cd server/discount
$ node app.js
Example app listening on port 3000
```
