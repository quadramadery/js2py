'use strict'

const test = require('tape')
const Pattern = require('../src/Pattern')

test('Pattern match', (t) => {
  const p1 = new Pattern('_1.minus(_2)')
  const p2 = new Pattern('BigN.minus(z)')

  t.plan(1)
  t.deepEqual(p1.match(p2.ast), [
    ['_1', { type: 'Identifier', name: 'BigN'}],
    ['_2', { type: 'Identifier', name: 'z'}]
  ])
})