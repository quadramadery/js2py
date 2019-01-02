'use strict'

class BigNumberVisitor {

  leaveNewExpression (ast) {
    if (ast.callee.name !== 'BigN') return
    return ast.arguments[0]
  }
}

module.exports = BigNumberVisitor