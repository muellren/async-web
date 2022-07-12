# Fake Web Shop

Simply `flask` web service that provides fake data.

```console
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
