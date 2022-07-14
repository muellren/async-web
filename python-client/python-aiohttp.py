"""
Example illustrating asynchronous requests to Web APIs using aiohttp.
"""
import aiohttp
import asyncio

USER_ID = 12345678
LIMIT = 5


async def main():
    """
    Request to User API and Orders API concurrently, then combines
    the results and issues a third request to the Discount API endpoint.
    """

    async with aiohttp.ClientSession() as session:
        # Asynchronous requests to User API
        async with session.get(
                f'http://localhost:4000/user/{USER_ID}') as resp:
            resp.raise_for_status()
            user = await resp.json()

        # Asynchronous requests to Orders API
        async with session.get(
                'http://localhost:4000/orders' +
                f'?by={USER_ID}&limit={LIMIT}') as resp:
            resp.raise_for_status()
            orders = await resp.json()

        score = user['score']
        last_orders = orders['last_orders']
        first_order_date = last_orders[0]['order_date']
        order_totals = sum(o['total'] for o in last_orders)
        discount_url = 'http://localhost:3000/discount' + \
            f'?score={score}&orders={LIMIT}&totals={order_totals}' + \
            f'&first_order_date={first_order_date}'

        # Asynchronous request to Discount API
        async with session.get(discount_url) as resp:
            resp.raise_for_status()
            discount = await resp.json()
            discount = discount['discount']
            print(f'discount for user {USER_ID}: {discount}')


if __name__ == '__main__':
    asyncio.run(main())
