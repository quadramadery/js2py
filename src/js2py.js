'use strict'

const espree = require('espree')

class Visitor {

  constructor() {
    this.indent = ''
  }

  indentInc() {
    this.indent += '  '
  }

  indentDec() {
    this.indent = this.indent.substring(0, this.indent.length - 2)
  }

  traverse(node) {
    if (node == null) return

    if (this[node.type]) {
      return this[node.type](node)
    } else {
      throw new Error(`unknown type ${JSON.stringify(node)}`)
    }
  }

  Identifier(node) {
    return node.name
  }

  Literal(node) {
    return node.raw
  }

  ArrayPattern(node) {
    const elems = node.elements.map(e => this.traverse(e)) 
    return `[ ${elems.join(', ')} ]`
  }

  ArrayExpression(node) {
    const elems = node.elements.map(e => this.traverse(e))
    return `[ ${elems.join(', ')} ]`
  }

  ClassBody(node) {
    const stmts = node.body.map(e => this.traverse(e))
    if (stmts.length === 0) {
      return `${this.indent}pass\n`
    }
    return this.indent + stmts.join(`${this.indent}\n`)
  }

  ClassDeclaration(node) {
    const id = this.traverse(node.id)
    const superClass = node.superClass ? `(${this.traverse(node.superClass)})` : ''
    this.indentInc()
    const body = this.traverse(node.body)
    this.indentDec()
    return `class ${id}${superClass}:\n${body}`
  }

  VariableDeclarator(node) {
    const id = this.traverse(node.id)
    const init = this.traverse(node.init)
    
    return `${id} = ${init}`
  }

  VariableDeclaration(node) {
    const decls = node.declarations.map(e => this.traverse(e))
    return decls.join('\n')
  }

  Program(node) {
    const stmts = node.body.map(e => this.traverse(e)) 
    return stmts.join('\n')
  }
}

class JS2Py {

  convert(code) {
    const ast = espree.parse(code, {
      ecmaVersion: 6
    })
    const visitor = new Visitor()
    return visitor.traverse(ast)
  }
}

module.exports = JS2Py
