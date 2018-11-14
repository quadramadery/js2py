'use strict'

const Pattern = require('./Pattern')

class BigNumberVisitor {

  constructor() {
    this.patterns = [
      [new Pattern('BigN._1(_2)'), '_1(_2)'],
      [new Pattern('_1.minus(_2)'), '_1 - _2'],
      [new Pattern('_1.plus(_2)'), '_1 + _2'],
      [new Pattern('_1.times(_2)'), '_1 * _2'],
      [new Pattern('_1.dividedBy(_2)'), '_1 / _2'],
    ]
  }

  leaveNewExpression (ast) {
    if (ast.callee.name !== 'BigN') return
    return ast.arguments[0]
  }

  leave(ast) {
    const patterns = this.patterns.filter(([from]) => from.type === ast.type)
    for (const [from, to] of patterns) {
      const matches = from.match(ast)
      if (matches) {
        return (new Pattern(to)).apply(matches)
      }
    }
  }
}

module.exports = BigNumberVisitor