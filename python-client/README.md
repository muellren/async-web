# Asynchronous Python

- [python-synchronous.py](python-synchronous.py): synchronously issued
  requests using `requests`.
- [python-asyncio.py](python-asyncio.py): asynchronous requests using
  `requests` wrapped into `asyncio` coroutines.
- [python-aiohttp.py](python-aiohttp.py): asynchronous requests using
  `aiohttp`.

## Implementation Basics

### Python Generator and Generator Functions

Generator objects are iterables (they have an `__iter__` method) as well as iterators (they have a `__next__` method).
A generator expression is an expression that produces a generator object:

```python
seq = (2 * n + 1 for n in range(10))
print(seq)   # <generator object main.<locals>.<genexpr>

it = iter(seq)
while True:
    try:
      x = next(it)
    except StopIteration:
       break
    print(x)
```

Obviously, the `for in` loop can be used (equivalent):

```python
for x in seq:
    print(x)
```

A generator function is a function that returns a generator object. An ordinary Python
function *becomes* a generator function if it contains at least one `yield` expression.

```python
def gen():
    yield 'Hello'       # 1st yield marks function as generator
    yield 'World'
    yield 42

g = gen()
print(g)  # <generator object gen at 0x103722500>

for x in g:
  print(x)
  # Hello
  # World
  # 42
```

`yield` also returns a value that is passed over through `send(...)`. If
the generator object is used as an iterator (via `next(...)`), `yield` returns
`None`.

```python
import dis

def gen():
    x = yield 42
    x += yield 'Hello'
    x += yield 'World'
    yield x

dis.dis(gen)

g = gen()       # <generator object gen at 0x102f8eb20>
i = 0
print(next(g))  # start iterator  -> 42
print(x)
while True:
    i += 1
    try:
        x = g.send(i)
    except StopIteration:
        break
    print(x)
```

Output:

```text
              0 GEN_START                0

  8           2 LOAD_CONST               1 (42)
              4 YIELD_VALUE
              6 STORE_FAST               0 (x)

  9           8 LOAD_FAST                0 (x)
             10 LOAD_CONST               2 ('Hello')
             12 YIELD_VALUE
             14 INPLACE_ADD
             16 STORE_FAST               0 (x)

 10          18 LOAD_FAST                0 (x)
             20 LOAD_CONST               3 ('World')
             22 YIELD_VALUE
             24 INPLACE_ADD
             26 STORE_FAST               0 (x)

 11          28 LOAD_FAST                0 (x)
             30 YIELD_VALUE
             32 POP_TOP
             34 LOAD_CONST               0 (None)
             36 RETURN_VALUE
<generator object gen at 0x104786b20>
42
Hello
World
6
```

Generators can be nested. With `yield from`, the outer generator delegates `yield`
to the inner generator until inner generator is exhausted.

```python
def outer_gen(inner):
    yield 'hello'
    yield from inner
    yield 'world'

def inner_gen(items):
    for i in range(items):
        yield i

inner = inner_gen(3)      # <generator object inner_gen at 0x10306f3e0>
outer = outer_gen(inner)  # <generator object outer_gen at 0x10306f450>
print(list(outer))        # ['hello', 0, 1, 2, 'world']
```

### Generator-based Coroutines (deprecated since Python 3.8, to be removed in 3.11)

Generator-based coroutines are generator functions in which `yield from` is
used to await on other coroutines or Futures.

They generator functions must be annotated the `@asyncio.coroutine` decorator.
Note that: generator-based coroutines are deprecated since Python 3.8 and scheduled
to be removed in Python 3.11. They are replaced by `await`/`async`, which provides coroutines through a native language feature
(see [PEP 492](https://peps.python.org/pep-0492/)).

```python
import asyncio

@asyncio.coroutine
def op1():
    print("op1: A")
    yield from asyncio.sleep(1)
    print("op1: B")
    yield from asyncio.sleep(2)
    print("op1: C")

o1 = op1()  # generator-based coroutine
loop = asyncio.get_event_loop()
loop.run_until_complete(o1)
````

The completion of coroutine can be turned into a future.

```python
...
@asyncio.coroutine
def op2():
    yield from asyncio.sleep(2)
    print("op2: A")
    yield from asyncio.sleep(2)
    print("op2: C")

future_o1 = asyncio.ensure_future(o1)
future_o2 = asyncio.ensure_future(o2)
future_o12 = asyncio.gather(future_o1, future_o2)
loop = asyncio.get_event_loop()
loop.run_until_complete(future_o12)
```

### Async/Await Coroutines

Since Python 3.5, coroutines are a first class citizen in the language through
the introduced `await`/`async` keywords
(see [PEP 492](https://peps.python.org/pep-0492/)).

```python
import asyncio
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

start = time.time()
asyncio.run(sequential())
end = time.time()
print(f'{end - start} secs')  # 3.0065722465515137 secs
```

The `await` serializes the execution of the `foo` and `bar` coroutines.
A coroutine an *awaitable* (like a Future and as Tasks).
The two coroutines can be issued concurrently. Execution resumes
if both have produced a result, i.e., the `await` is applied on a
Future that, upon completion, holds the return values of both coroutines.

```python
async def concurrent():
    r1, r2 = await asyncio.gather(foo(), bar())
    print(r1 + r2)

start = time.time()
asyncio.run(concurrent())
end = time.time()
print(f'{end - start} secs')  # 2.003338098526001 secs
```

The execution time is reduced from three seconds to 2 seconds if the
coroutines are run concurrently. Bytecode of async function `bar()`.

```python
dis.dis(bar)
#               0 GEN_START                1

#  16           2 LOAD_GLOBAL              0 (asyncio)
#               4 LOAD_METHOD              1 (sleep)
#               6 LOAD_CONST               1 (1)
#               8 CALL_METHOD              1
#              10 GET_AWAITABLE
#              12 LOAD_CONST               0 (None)
#              14 YIELD_FROM
#              16 POP_TOP

#  17          18 LOAD_GLOBAL              2 (print)
#              20 LOAD_CONST               2 ('Brave')
#              22 CALL_FUNCTION            1
#              24 POP_TOP

#  18          26 LOAD_CONST               3 (7)
#              28 RETURN_VALUE
