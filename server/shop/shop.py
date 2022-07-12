from flask import Flask, abort, request
from random import Random
from faker import Faker
from datetime import datetime, timedelta

DATE_FORMAT = '%Y-%m-%d'

app = Flask(__name__)

@app.route('/user/<int:userid>', methods=['GET'])
def get_user_profile(userid):
    random = Random(0xdeadbeef * userid)

    Faker.seed(0xdeadbeef * userid)
    fake = Faker('en-US')

    return {
        'userid': userid,
        'dob': fake.date_of_birth(minimum_age=18, maximum_age=92).strftime(DATE_FORMAT),
        'joined': fake.date_of_birth(minimum_age=0, maximum_age=10).strftime(DATE_FORMAT),
        'name': fake.name(),
        'email': fake.email(),
        'street': fake.street_address(),
        'zip': int(fake.postcode()),
        'city': fake.city(),
        'state': fake.state(),
        'score': random.randint(0, 100)
    }


@app.route('/orders', methods=['GET'])
def get_orders():
    userid = int(request.args.get('by'))
    if userid is None:
      abort(400)

    limit = int(request.args.get('limit', '5'))

    random = Random(0xdeadbeef * userid)

    dates = list(((datetime.now() - timedelta(days=random.randint(0, 100))))
                 for _ in range(0, limit))
    dates = list(map(lambda d: d.strftime(DATE_FORMAT), sorted(dates)))
    totals = (random.randint(100, 999999) / 100 for _ in range(0, limit))
    orders = list({'order_date': d, 'total': t}
                  for (d, t) in zip(dates, totals))

    return {
        'last_orders': orders
    }
