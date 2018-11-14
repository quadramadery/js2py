'use strict'

const Pattern = require('./Pattern')

class ArraysVisitor {

  leaveNewExpression (ast) {
    if (ast.callee.name !== 'BigN') return
    return ast.arguments[0]
  }

  leaveCallExpression (ast) {
    const patterns = [
      ['(_1).length', 'len(_1)'],
      ['_1.push(_2)', '_1.append(_2)'],
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

module.exports = ArraysVisitor