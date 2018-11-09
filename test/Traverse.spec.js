'use strict'

const espree = require('espree')
const test = require('tape')
const Traverse = require('../src/Traverse')

test('Traverse visits every node', (t) => {
  const ast = espree.parse(`
    function sum (a, b) {
      return a + b
    }
  `)

  const visited = []
  Traverse.traverse(ast, {
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

test('Traverse modifies ast', (t) => {
  const ast = espree.parse(`
    a = b
  `)

  const ast2 = Traverse.traverse(ast, {
    leaveAssignmentExpression: (ast) => ast.right
  })

  t.plan(1)
  t.deepEqual(ast2, {
    type: 'Program',
    start: 0, end: 13,
    body: [
      { 
        type: 'ExpressionStatement',
        start: 5, end: 10,
        expression: {
          type: 'Identifier',
          start: 9, end: 10,
          name: 'b'
        }
      }
    ],
    sourceType: 'script'
  })
})
