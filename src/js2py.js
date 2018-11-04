'use strict'

const espree = require('espree')

class Visitor {
  
  constructor() {
    this.DEFAULT_INDENT = '  '
    this.indent = ''
  }

  indentInc() {
    this.indent += this.DEFAULT_INDENT
  }

  indent2() {
    return this.indent + this.DEFAULT_INDENT
  }

  indentDec() {
    this.indent = this.indent.substring(0, this.indent.length - this.DEFAULT_INDENT.length)
  }

  traverse(node) {
    if (node == null) return

    if (node.type === undefined) {
      throw new Error(`Not a node ${JSON.stringify(node)}`)
    }

    if (this[node.type]) {
      return this[node.type](node)
    } else {
      throw new Error(`Unknown node type ${node.type} (${Object.keys(node)})`)
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

  BlockStatement(node) {
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

  BinaryExpression(node) {
    const left = this.traverse(node.left)
    const right = this.traverse(node.right)
    const left2 = node.left.type === 'BinaryExpression' ? `(${left})` : left
    const right2 = node.right.type === 'BinaryExpression' ? `(${right})` : right
    return `${left2} ${node.operator} ${right2}`
  }

  ForStatement(node) {
    const asForInRange = false ||
      (node.init.type === 'VariableDeclaration' && node.init.declarations.length === 1) &&
      (node.update.type === 'UpdateExpression' && node.update.operator === '++') &&
      (node.test.type === 'BinaryExpression')

    if (asForInRange) {
      this.indentInc()
      const body = this.traverse(node.body)
      this.indentDec()

      const id = node.init.declarations[0].id.name
      const low = this.traverse(node.init.declarations[0].init)
      const high = this.traverse(node.test.right)
      return `for ${id} in range(${low}, ${high}):\n${body}`
    } else {
      const init = this.traverse(node.init)
      const test = this.traverse(node.test)
      const update = this.traverse(node.update)
      this.indentInc()
      const body = this.traverse(node.body)
      this.indentDec()
      return `${init}
${this.indent}while ${test}:
${this.indent}${body}${this.indent2()}${update}
`
    }
  }

  ExpressionStatement(node) {
    return this.traverse(node.expression)
  }

  AssignmentExpression(node) {
    const left = this.traverse(node.left)
    const right = this.traverse(node.right)
    return `${left} ${node.operator} ${right}`    
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
