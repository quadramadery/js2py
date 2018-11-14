'use strict'

const espree = require('espree')
const Traverse = require('./Traverse')
const BigNumberVisitor = require('./BigNumberVisitor')
const ToPyCodeVisitor = require('./ToPyCodeVisitor')
console.log('tpc', ToPyCodeVisitor)

class JS2Py {

  convert(code) {
    const ast = espree.parse(code, {
      ecmaVersion: 6
    })
    Traverse.traverse(ast, new BigNumberVisitor())
    
    const toText = new ToPyCodeVisitor()
    Traverse.traverse(ast, toText)
    return ast.text
  }
}

module.exports = JS2Py
