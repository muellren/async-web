"""
Some experiments with generator expressions and generator functions.
"""

import dis


def gen():
    x = yield 42
    x += yield 'Hello'
    x += yield 'World'
    yield x


dis.dis(gen)

g = gen()
print(g)

i = 0
x = next(g)  # start iterator
print(x)
while True:
    i += 1
    try:
        x = g.send(i)
    except StopIteration:
        break
    print(x)


def outer_gen(inner):
    yield 'hello'
    yield from inner
    yield 'world'


def inner_gen(items):
    for i in range(items):
        yield i


inner = inner_gen(3)
outer = outer_gen(inner)
print(inner)
print(outer)

print(list(outer))

# Generator expressions
seq = (2 * n + 1 for n in range(10)
       )    # <generator object main.<locals>.<genexpr>
print(seq)

# Iterate over generator expression
while True:
    try:
        x = next(seq)
    except StopIteration:
        break
    print(x)

    # for x in seq:
    #   print(x)

    # l = list(seq)
    # print(l)
