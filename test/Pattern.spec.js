'use strict'

const test = require('tape')
const Pattern = require('../src/Pattern')

test('Pattern match', (t) => {
  const p1 = new Pattern('_1.minus(_2)')
  const p2 = new Pattern('BigN.minus(z)')

  t.plan(1)
  t.deepEqual(p1.match(p2.ast), {
    '_1': { type: 'Identifier', name: 'BigN', start: 0, end: 4},
    '_2': { type: 'Identifier', name: 'z', start: 11, end: 12}
  })
})

test('Pattern apply', (t) => {
  const p1 = new Pattern('_1  - _2')

  const ast = p1.apply({
    '_1': { type: 'Identifier', name: 'BigN'},
    '_2': { type: 'Identifier', name: 'z'}
  })

  t.plan(1)
  t.deepEqual(ast, {
    type: 'ExpressionStatement',
    start: 0, end: 8,
    expression: {
      type: 'BinaryExpression',
      start: 0, end: 8,
      left: {
        type: 'Identifier',
        name: 'BigN'
      },
      operator: '-',
      right: {
        type: 'Identifier',
        name: 'z'
      }
    }
  })
})