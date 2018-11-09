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

test('Apply pattern to expression', (t) => {
  const p1 = new Pattern('_1  - _2')

  const ast = p1.apply({
    '_1': { type: 'Identifier', name: 'BigN'},
    '_2': { type: 'Identifier', name: 'z'}
  })

  t.plan(1)
  t.deepEqual(ast, {
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
  })
})

test('Apply pattern to statement', (t) => {
  const p1 = new Pattern('if (_1) {_2}')

  const ast = p1.apply({
    '_1': { type: 'Literal', value: 'true'},
    '_2': { type: 'ExpressionStatement', expression: { type: 'Identifier', name: 'z'}}
  })

  t.plan(1)
  t.deepEqual(ast, {
    type: 'IfStatement',
    start: 0, end: 12,
    test: { type: 'Literal', value: 'true' },
    consequent: {
      type: 'BlockStatement',
      start: 8, end: 12, 
      body: [
        {
          type: 'ExpressionStatement', 
          start: 9, end: 11,
          expression: { 
            type: 'ExpressionStatement', 
            expression: {
              type: 'Identifier',
              name: 'z'
            }
          }
        }
      ]
    },
    alternate: null
  })
})