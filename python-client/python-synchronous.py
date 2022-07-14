"""
Example illustrating multiple synchronous sequential requests to Web APIs.
"""
import requests

USER_ID = 12345678
LIMIT = 5


def main():
    """
    Request to User API, then Orders API then combines the results and
    issues a third request to the Discount API endpoint.
    """
    # Synchronous request to User API
    user_request = f'http://localhost:4000/user/{USER_ID}'
    user_response = requests.get(user_request)
    user_response.raise_for_status()
    user = user_response.json()
    score = user['score']

    # Synchronous request to Orders API
    orders_request = f'http://localhost:4000/orders?by={USER_ID}&limit={LIMIT}'
    orders_response = requests.get(orders_request)
    orders_response.raise_for_status()
    orders = orders_response.json()
    last_orders = orders['last_orders']
    first_order_date = last_orders[0]['order_date']
    order_totals = sum(o['total'] for o in last_orders)

    # Synchronous request to Discount API
    discount_request = 'http://localhost:3000/discount' + \
        f'?score={score}&orders={LIMIT}&totals={order_totals}' + \
        f'&first_order_date={first_order_date}'
    discount_response = requests.get(discount_request)
    discount_response.raise_for_status()
    discount = discount_response.json()
    discount = discount['discount']
    print(f'discount for user {USER_ID}: {discount}')


if __name__ == '__main__':
    main()
