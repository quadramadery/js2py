'use strict'

const Pattern = require('./Pattern')

class ArraysVisitor {

  constructor () {
    this.patterns = [
      [new Pattern('(_1).length'), 'len(_1)'],
      [new Pattern('_1.push(_2)'), '_1.append(_2)'],
      [new Pattern('_1.splice(_2, 1)'), 'delete _1[_2]'],
      [new Pattern('_1[len(_2) - _3]'), '_1[-_3]'],
      [new Pattern('_isEmpty(_2)'), 'len(_2) == 0'], // TODO restrict to lodash._isEmpty
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

module.exports = ArraysVisitor