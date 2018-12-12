'use strict'

const Pattern = require('./Pattern')

class JSVisitor {

  constructor () {
    const importDeclFn = (matches) => ({
      type: 'ImportDeclaration',
      specifiers: [{
        type: 'ImportDefaultSpecifier',
        local: matches._1
      }],
      source: matches._2
    })
    const remove = () => ({ type: 'Noop' })

    this.patterns = [
      [new Pattern('_1 = require(_2)'), importDeclFn],
      [new Pattern('const _1 = require(_2)'), importDeclFn],
      [new Pattern('"use static"', {matchStatement: true}), remove],
    ]
  }

  leave(ast) {
    const patterns = this.patterns.filter(([from, toFn]) => from.type === ast.type)
    for (const [from, toFn] of patterns) {
      const matches = from.match(ast)
      if (matches) {
        return toFn(matches)
      }
    }
  }
}

module.exports = JSVisitor