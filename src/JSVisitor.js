'use strict'

const Pattern = require('./Pattern')

class JSVisitor {

  constructor () {
    this.patterns = [
      [new Pattern('_1 = require(_2)')],
      [new Pattern('const _1 = require(_2)')],
    ]
  }

  leave(ast) {
    const patterns = this.patterns.filter(([from]) => from.type === ast.type)
    for (const [from, to] of patterns) {
      const matches = from.match(ast)
      if (matches) {
        return {
          type: 'ImportDeclaration',
          specifiers: [{
            type: 'ImportDefaultSpecifier',
            local: matches._1
          }],
          source: matches._2
        }
      }
    }
  }
}

module.exports = JSVisitor