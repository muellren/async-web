"""
Async/Await-based coroutines
"""

import asyncio
import dis
import time


async def foo():
    print('Hello')
    await asyncio.sleep(2)
    print('World')
    return 42


async def bar():
    await asyncio.sleep(1)
    print('Brave')
    return 7


async def sequential():
    r1 = await foo()
    r2 = await bar()
    print(r1 + r2)

dis.dis(bar)

start = time.time()
asyncio.run(sequential())
end = time.time()
print(f'{end - start} secs')      # 3.005


async def concurrent():
    r1, r2 = await asyncio.gather(foo(), bar())
    print(r1 + r2)

start = time.time()
asyncio.run(concurrent())
end = time.time()
print(f'{end - start} secs')      # 2.005
