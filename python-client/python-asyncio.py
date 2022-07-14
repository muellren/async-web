"""
Example illustrating asynchronous requests to Web APIs using asyncio.
"""
import asyncio
import requests

USER_ID = 12345678
LIMIT = 5


async def main():
    """
    Request to User API and then Orders API concurrently, then combines
    the results and issues a third request to the Discount API endpoint.
    """
    loop = asyncio.get_running_loop()

    # Asynchronous request to User API
    def user_request():
        resp = requests.get(f'http://localhost:4000/user/{USER_ID}')
        resp.raise_for_status()
        return resp.json()

    user_resp_future = loop.run_in_executor(None, user_request)

    # Asynchronous request to Orders API
    def orders_request():
        resp = requests.get(
            f'http://localhost:4000/orders?by={USER_ID}&limit={LIMIT}')
        resp.raise_for_status()
        return resp.json()

    orders_resp_future = loop.run_in_executor(None, orders_request)

    # gather responses of both requests
    [user, orders] = await asyncio.gather(user_resp_future,
                                          orders_resp_future)
    score = user['score']
    last_orders = orders['last_orders']
    first_order_date = last_orders[0]['order_date']
    order_totals = sum(o['total'] for o in last_orders)

    # Asynchronous request to Discount API
    def discount_request():
        req = 'http://localhost:3000/discount' + \
            f'?score={score}&orders={LIMIT}&totals={order_totals}' + \
            f'&first_order_date={first_order_date}'
        resp = requests.get(req)
        resp.raise_for_status()
        return resp.json()

    discount_resp_future = loop.run_in_executor(None, discount_request)

    discount = await discount_resp_future
    discount = discount['discount']
    print(f'discount for user {USER_ID}: {discount}')


if __name__ == '__main__':
    asyncio.run(main())
