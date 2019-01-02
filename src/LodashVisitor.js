'use strict'

const Pattern = require('./Pattern')

class LodashVisitor {

  constructor() {
    this.patterns = [
      [new Pattern('_isEmpty(_1)'), 'len(_1) === 0'], // TODO restrict to lodash.isEmpty
      [new Pattern('_max(_1)'), 'max(_1)'], // TODO restrict to lodash.max
      [new Pattern('_min(_1)'), 'min(_1)'], // TODO restrict to lodash.min
    ]
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

module.exports = LodashVisitor