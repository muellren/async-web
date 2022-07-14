"""
Generator-based coroutines.
Currently deprecated, use async/await keyword instead.
To be removed in Python 3.11.
"""

import asyncio


@asyncio.coroutine
def op1():
    print("op1: A")
    yield from asyncio.sleep(1)
    print("op1: B")
    yield from asyncio.sleep(2)
    print("op1: C")


@asyncio.coroutine
def op2():
    yield from asyncio.sleep(2)
    print("op2: A")
    yield from asyncio.sleep(2)
    print("op2: C")


o1 = op1()  # generator-based coroutine
o2 = op2()  # generator-based coroutine
print(o1, o2)

future_o1 = asyncio.ensure_future(o1)
future_o2 = asyncio.ensure_future(o2)
future_o12 = asyncio.gather(future_o1, future_o2)
loop = asyncio.get_event_loop()
loop.run_until_complete(future_o12)
