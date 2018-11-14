'use strict'

const Pattern = require('./Pattern')

class BigNumberVisitor {

  leaveNewExpression (ast) {
    if (ast.callee.name !== 'BigN') return
    return ast.arguments[0]
  }

  leaveCallExpression (ast) {
    const patterns = [
      ['BigN._1(_2)', '_1(_2)'],
      ['_1.minus(_2)', '_1 - _2'],
      ['_1.plus(_2)', '_1 + _2'],
      ['_1.times(_2)', '_1 * _2'],
      ['_1.dividedBy(_2)', '_1 / _2'],
    ]
    for (const [from, to] of patterns) {
      const p = new Pattern(from)
      const matches = p.match(ast)
      if (matches) {
        return (new Pattern(to)).apply(matches)
      }
    }
  }
}

module.exports = BigNumberVisitor