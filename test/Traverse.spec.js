'use strict'

const espree = require('espree')
const test = require('tape')
const Traverse = require('../src/Traverse')

const tr = new Traverse()

test('Traverse', (t) => {
  const ast = espree.parse(`
    function sum (a, b) {
      return a + b
    }
  `)

  const visited = []
  tr.traverse(ast, {
    enter: (ast) => visited.push(ast.type)
  })

  t.plan(1)
  t.deepEqual(visited, [
    'Program',
    'FunctionDeclaration', // function...
    'Identifier', // sum
    'Identifier', // (a,
    'Identifier', // b)
    'BlockStatement', // {
    'ReturnStatement', // return
    'BinaryExpression', // a + b
    'Identifier', // a
    'Identifier' // b
  ])
})
