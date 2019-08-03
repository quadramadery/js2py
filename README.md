Converts JavaScript to Python
-----------------------------------

Proof of concept, converting JS to Python, for example:

```js
const BigN = require('bignumber.js')

class Calculator extends MathDevice {
  constructor (args = []) {
    super({})
  }

  static max (a, b) {
    return BigN.max(a, b)
  }
}
```

into 

```py
class Calculator(MathDevice):
  def __init__(self, args = []):
    super().__init__({})

  def add(self, a, b):
    return max(a, b)
```
