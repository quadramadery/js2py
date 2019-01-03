'use strict'

const Pattern = require('./Pattern')

class ApplyPatternsVisitor {

  constructor(patterns) {
    this.patterns = patterns.map(([from, to]) => [new Pattern(from), to])
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

module.exports = ApplyPatternsVisitor