'use strict'

const test = require('tape')
const JS2Py = require('../src/js2py')

const f = new JS2Py()

test('variable declarator', (t) => {
  t.plan(1)
  t.equal(f.convert('var a = 1'), 'a = 1')
})

test('const declarator', (t) => {
  t.plan(1)
  t.equal(f.convert('const a = 1'), 'a = 1')
})

test('destructure declarator', (t) => {
  t.plan(2)
  t.equal(f.convert('const [a] = 1'), '[ a ] = 1')
  t.equal(f.convert('const [a, b] = [1, 2]'), '[ a, b ] = [ 1, 2 ]')
})

test('class ', (t) => {
  t.plan(2)
  t.equal(f.convert('class A {}'), `class A:
  pass
`)
  t.equal(f.convert('class A extends B {}'), `class A(B):
  pass
`)
})