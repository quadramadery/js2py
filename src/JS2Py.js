'use strict'

const espree = require('espree')
const Traverse = require('./Traverse')
const BigNumberVisitor = require('./BigNumberVisitor')
const ArraysVisitor = require('./ArraysVisitor')
const JSVisitor = require('./JSVisitor')
const inlineStaticClassAttrs = require('./InlineStaticClassAttrs')
const ToPyCodeVisitor = require('./ToPyCodeVisitor')

class JS2Py {

  convert(code) {
    const ast = espree.parse(code, {
      ecmaVersion: 8,
      sourceType: 'module'
    })
    Traverse.traverse(ast, new BigNumberVisitor())
    Traverse.traverse(ast, new ArraysVisitor())
    Traverse.traverse(ast, new JSVisitor())
    inlineStaticClassAttrs(ast)
    
    const toText = new ToPyCodeVisitor()
    Traverse.traverse(ast, toText)
    return ast.text
  }
}

module.exports = JS2Py
