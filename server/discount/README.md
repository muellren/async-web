# Discount Compute Service

```console
$ node app.js
Example app listening on port 3000
```

```console
$ curl http://127.0.0.1:3000/discount\?score\=100\&orders\=5\&totals\=12345.33\&first_order_date\=2022-01-01
{"discount":0.06429859375000001}%
```