'use strict'

const test = require('tape')
const fs = require('fs')
const JS2Py = require('../src/JS2Py')

const f = new JS2Py()

test('indenting', (t) => {
  const cases = [
    [`for (let i = 0; i < 10; i++) { for (let j = 0; j < i; j++) { i+j }}`, 
`for i in range(0, 10):
  for j in range(0, i):
    i + j`],
    ['class A { b() { c(); d() } }', 'class A:\n  def b(self):\n    c()\n    d()\n\n'],
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('if', (t) => {
  const cases = [
    ['if (true) { a() } else { b() }', 'if true:\n  a()\nelse:\n  b()'],
    ['if (true) a(); else b()', 'if true:\n  a()\nelse:\n  b()'],
    ['if (a) b()', 'if a:\n  b()'],
    ['if (a) if (b) if (c) { d() } else { e() }', 'if a:\n  if b:\n    if c:\n      d()\n    else:\n      e()'],
    ['if (a) { b() } else for (let i = 0; i < 10; i++) { d(i) }', 'if a:\n  b()\nelse:\n  for i in range(0, 10):\n    d(i)'],
    ['if (a) { b() } else if (c) d()', 'if a:\n  b()\nelif c:\n  d()'],
    ['if (a) { b() } else if (c) { d() }', 'if a:\n  b()\nelif c:\n  d()'],
    ['function z() { if (a) { b() } else if (c) { d() } else if (e) { f() } else { g() }}', 'def z():\n  if a:\n    b()\n  elif c:\n    d()\n  elif e:\n    f()\n  else:\n    g()\n'],
    ['if (a) if (b) c()', 'if a:\n  if b:\n    c()'],
    ['class A { b() { if (a) b() } }', 'class A:\n  def b(self):\n    if a:\n      b()\n\n'],
    ['class A { b() { if (a) { b() } } }', 'class A:\n  def b(self):\n    if a:\n      b()\n\n'],
    ['function b() { if (a) { b() } }', 'def b():\n  if a:\n    b()\n'],
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('js parts', (t) => {
  const cases = [
    [`B = require('a')`, 'from a import B'],
    [`const B = require('a')`, 'from a import B'],
    [`"use static"`, ''],
    [`'use static'`, ''],
    [`"other directive"`, ''],
    [`a = "use static"`, 'a = "use static"'],
    [`module.exports = a`, ''],
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('for as while', (t) => {
  t.plan(1)
  t.equal(f.convert('for (let i = 0, j = 1; i < j; i += 1) {}'), `i = 0
j = 1
while i < j:
  pass
  i += 1`)
})

test('for range', (t) => {
  t.plan(1)
  t.equal(f.convert('for (let i = 0; i < period; i++) {}'), 'for i in range(0, period):\n  pass')
})


test('language parts', (t) => {
  const cases = [
    ['var a = 1', 'a = 1'],
    ['let a', ''],
    ['const a = 1', 'a = 1'],
    ['const [a] = 1', '[ a ] = 1'],
    ['const [a, b] = [1, 2]', '[ a, b ] = [1, 2]'],
    ['new Foo()', 'Foo()'],
    ['a.b()', 'a.b()'],
    ['a[b]', 'a[b]'],
    ['a.b', 'a.b'],
    ['a()', 'a()'],
    ['offset * (period - 1)', 'offset * (period - 1)'],
    ['function a(b, c) {}', 'def a(b, c):\n  pass\n'],
    ['function a() {return}', 'def a():\n  return\n'],
    ['function a() {return 1}', 'def a():\n  return 1\n'],
    ['class A {}', 'class A:\n  pass\n'],
    ['function a() { class A {} }', 'def a():\n  class A:\n    pass\n\n'],
    ['class A extends B {}', 'class A(B):\n  pass\n'],
    ['class A { constructor (b, c) {} }', 'class A:\n  def __init__(self, b, c):\n    pass\n\n'],
    ['class A { b() { super.b() } }', 'class A:\n  def b(self):\n    super().b()\n\n'],
    ['class A { b() { super() } }', 'class A:\n  def b(self):\n    super().__init__()\n\n'],
    ['class A { b() { this.b() } }', 'class A:\n  def b(self):\n    self.b()\n\n'],
    ['class A { static b() { f() } }', 'class A:\n  def b():\n    f()\n\n'],
    ['a === b', 'a == b'],
    ['a = {}', 'a = {}'],
    ['function a() { b = {} }', 'def a():\n  b = {}\n'],
    ['a = {b: 1}', `a = {\n  'b': 1\n}`],
    ['function f() { a = {b: 1}}', `def f():\n  a = {\n    'b': 1\n  }\n`],
    ['a = {b: 1, c:d}', `a = {\n  'b': 1,\n  'c': d\n}`],
    ['`text`', `'text'`],
    ['`hi ${a}/${b} in ${c}`', `'hi %f/%f in %f' % (a, b, c)`],
    ['delete a[0]', 'del a[0]'],
    ['-a', '-a'],
    ['+a', '+a'],
    ['!a', 'not a'],
    ['a || b', 'a or b'],
    ['a && b', 'a and b'],
    ['a ? b : c', 'b if a else c'],
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('BigNumber', (t) => {
  const cases = [
    ['new BigN(a)', 'a'],
    ['BigN.max(list)', 'max(list)'],
    ['a.minus(b)', 'a - b'],
    ['a.plus(b)', 'a + b'],
    ['a.times(b)', 'a * b'],
    ['a.dividedBy(b)', 'a / b'],
    ['a.minus(b).times(0.5).plus(c.times(0.25))', '((a - b) * 0.5) + (c * 0.25)'],
    ['a.toNumber()', 'a'],
    ['a.isEqualTo(b)', 'a == b'],
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('Array', (t) => {
  const cases = [
    ['z.push(a)', 'z.append(a)'],
    ['z.length', 'len(z)'],
    ['z.splice(0, 1)', 'del z[0]'],
    ['a[a.length - 1]', 'a[-1]'],
    ['a.map(f)', 'map(f, a)'],
    ['a.filter(f)', 'filter(f, a)'],
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('math', (t) => {
  const cases = [
    ['Math.max(1)', 'max([1])'],
    ['Math.max(1, 2, 3)', 'max([1, 2, 3])'],
    ['Math.min(1, 2, 3)', 'min([1, 2, 3])'],
    ['Math.exp(1)', 'exp(1)'],
    ['Math.pow(1)', 'pow(1)'],
    ['Math.abs(1)', 'abs(1)'],
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('lodash', (t) => {
  const cases = [
    ['_isEmpty(a)', 'len(a) == 0'],
    ['_isFinite(a)', 'isfinite(a)'],
    ['_max(a)', 'max(a)'],
    ['_min(a)', 'min(a)'],
    ['_sum(a)', 'sum(a)'],
    ["const a = require('lodash/isFinite')", 'from math import isfinite'],
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('Inline static class attrs', (t) => {
  const cases = [
    ['class A { fun() {return A.id}} A.id = "MyId"', 'class A:\n  def fun(self):\n    return "MyId"\n\n']
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('ObjectPattern', (t) => {
  const cases = [
    ['let { a } = b', 'a = b.a'],
    ['let { } = b', ''],
    ['let { a, b } = c; d = a + b', 'd = c.a + c.b'],
    ['let { a, b } = c; d = j.a + j[a]', 'd = j.a + j[c.a]'],
    ['f(a); function b() { let { a, b } = g }', 'f(a)\ndef b():\n  pass\n'],
    ['let { a, b } = c(); d = a + b', 'c1 = c()\nd = c1.a + c1.b'],
    ['let { a, b } = x.y.c(); d = a + b', 'c = x.y.c()\nd = c.a + c.b'],
    ['let { a, b } = f()(); d = a + b', 'tmp = f()()\nd = tmp.a + tmp.b']
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test('Arrow functions', (t) => {
  const cases = [
    ['(a) => a', 'lambda a: a']
  ]
  t.plan(cases.length)
  cases.map(([js, expected]) => t.equal(f.convert(js), expected, js))
})

test.skip('Manage/Insert imports', (t) => {
  t.plan(1)
})

