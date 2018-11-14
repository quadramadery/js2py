'use strict'

const espree = require('espree')
const Traverse = require('./Traverse')
const BigNumberVisitor = require('./BigNumberVisitor')
const ArraysVisitor = require('./ArraysVisitor')
const ToPyCodeVisitor = require('./ToPyCodeVisitor')

class JS2Py {

  convert(code) {
    const ast = espree.parse(code, {
      ecmaVersion: 8
    })
    Traverse.traverse(ast, new BigNumberVisitor())
    Traverse.traverse(ast, new ArraysVisitor())
    
    const toText = new ToPyCodeVisitor()
    Traverse.traverse(ast, toText)
    return ast.text
  }
}

module.exports = JS2Py
