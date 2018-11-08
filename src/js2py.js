'use strict'

const espree = require('espree')
const Traverse = require('./Traverse')

class ToTextVisitor {

  constructor() {
    this.DEFAULT_INDENT = '  '
    this.indent = ''
  }

  I(cb) {
    this.indentInc()
    const ret = cb.bind(this)()
    this.indentDec()
    return ret
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

  leaveIdentifier(node) {
    node.text = node.name
  }

  leaveLiteral(node) {
    node.text = node.raw
  }

  leaveArrayPattern(node) {
    const elems = node.elements.map(e => e.text) 
    node.text = `[ ${elems.join(', ')} ]`
  }

  leaveArrayExpression(node) {
    const elems = node.elements.map(e => e.text)
    node.text = `[ ${elems.join(', ')} ]`
  }

  leaveClassBody(node) {
    const stmts = node.body.map(e => e.text)
    if (stmts.length === 0) {
      node.text = `${this.indent2()}pass\n`
      return
    }
    node.text = this.indent + stmts.join(`${this.indent}\n`)
  }

  enterBlockStatement(node) {
    this.indentInc()
  }
  leaveBlockStatement(node) {
    const stmts = node.body.map(e => e.text)
    if (stmts.length === 0) {
      node.text = `${this.indent}pass\n`
    } else {
      node.text = this.indent + stmts.join(`${this.indent}\n`)
    }
    this.indentDec()
  }

  leaveClassDeclaration(n) {
    const superClass = n.superClass ? `(${n.superClass.text})` : ''
    n.text = `class ${n.id.text}${superClass}:
${n.body.text}`
  }

  leaveExpressionStatement(ast) {
    ast.text = ast.expression.text
  }

  leaveBinaryExpression(node) {
    const left = node.left.type === 'BinaryExpression' ? `(${node.left.text})` : node.left.text
    const right = node.right.type === 'BinaryExpression' ? `(${node.right.text})` : node.right.text
    node.text = `${left} ${node.operator} ${right}`
  }

  leaveForStatement(node) {
    const asForInRange = false ||
      (node.init.type === 'VariableDeclaration' && node.init.declarations.length === 1) &&
      (node.update.type === 'UpdateExpression' && node.update.operator === '++') &&
      (node.test.type === 'BinaryExpression')

    if (asForInRange) {
      const id = node.init.declarations[0].id.name
      const low = node.init.declarations[0].init.text
      const high = node.test.right.text
      node.text = `for ${id} in range(${low}, ${high}):\n${node.body.text}`
      return
    } else {
      const init = node.init.text
      const test = node.test.text
      const update = node.update.text
      const body = node.body.text
      node.text = `${init}
${this.indent}while ${test}:
${this.indent}${body}${this.indent2()}${update}
`
      return
    }
  }

  leaveIfStatement(node) {
    const optionalAlternate = node.alternate ? `\nelse:\n${this.indent}${node.alternate.text}` : ''
    
    node.text = `if ${node.test.text}:
${this.indent}${node.consequent.text}${optionalAlternate}`
  }

  leaveCallExpression(node) {
    const args = node.arguments.map(arg => arg.text)
    node.text = `${node.callee.text}(${args.join(', ')})`
  }

  leaveMemberExpression(node) {
    node.text = `${node.object.text}.${node.property.text}`
  }

  leaveNewExpression(node) {
    const args = node.arguments.map(arg => arg.text)
    node.text = `${node.callee.text}(${args.join(', ')})`
  }

  leaveAssignmentExpression(node) {
    node.text = `${node.left.text} ${node.operator} ${node.right.text}`    
  }

  leaveVariableDeclarator(node) {
    node.text =`${node.id.text} = ${node.init.text}`
  }

  leaveVariableDeclaration(node) {
    const decls = node.declarations.map(e => e.text)
    node.text = decls.join('\n')
  }

  leaveProgram(node) { 
    node.text = node.body.map(e => e.text).join('\n')
  }
}

class BigNumberVisitor {

  leaveNewExpression (ast) {
    if (ast.callee.name !== 'BigN') return
    this.mutate(ast, ast.arguments[0])
  }

  mutate (dst, src) {
    Object.keys(dst).map(k => {
      delete dst[k]
    })
    Object.keys(src).map(k => {
      dst[k] = src[k]
    })
  }
}

class JS2Py {

  convert(code) {
    const ast = espree.parse(code, {
      ecmaVersion: 6
    })
    const t = new Traverse()
    t.traverse(ast, new BigNumberVisitor())
    
    const toText = new ToTextVisitor()
    t.traverse(ast, toText)
    return ast.text
  }
}

module.exports = JS2Py
