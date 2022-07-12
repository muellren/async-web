// Fibonacci sequence as a generator function
function* fibonacci() {
  let current = 1
  let next = 1
  while (true) {
    let done = yield current;
    [current, next] = [next, next + current]
    if (done) {
      return current
    }
  }
}

const seq = fibonacci()
for (let i = 0; i<12; i += 1) {
  console.log(i, seq.next(i == 9).value)
}
