'use strict'

const espree = require('espree')
const Traverse = require('./Traverse')
const Pattern = require('./Pattern')

class ToPyCodeVisitor {

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

  leaveSuper(node) {
    node.text = 'super()'
  }

  leaveIdentifier(node) {
    node.text = node.name
  }

  leaveLiteral(node) {
    node.text = node.value === null ? 'None' : node.raw
  }

  leaveThisExpression(node) {
    node.text = 'self'
  }

  leaveArrayPattern(node) {
    const elems = node.elements.map(e => e.text) 
    node.text = `[${elems.join(', ')}]`
  }

  leaveProperty(node) {
    node.text = `'${node.key.text}': ${node.value.text}`
  }

  enterObjectExpression(node) {
    this.indentInc()
  }

  leaveObjectExpression(node) {
    if (node.properties.length === 0) {
      node.text = '{}'
      return
    } 

    const properties = node.properties.map(p => p.text)
    node.text = `{\n${this.indent}${properties.join(`,\n${this.indent}`)}\n}`
    this.indentDec()
  }

  leaveArrayExpression(node) {
    const elems = node.elements.map(e => e.text)
    node.text = `[${elems.join(', ')}]`
  }

  leaveAssignmentPattern(node) {
    node.text = `${node.left.text} = ${node.right.text}`
  }

  enterClassBody(node) {
    this.indentInc()
  }
  leaveClassBody(node) {
    const stmts = node.body.map(e => e.text)
    if (stmts.length === 0) {
      node.text = `${this.indent}pass\n`
      return
    }
    node.text = this.indent + stmts.join(`\n${this.indent}`) + '\n'
    this.indentDec()
  }

  enterBlockStatement(node) {
    this.indentInc()
  }
  leaveBlockStatement(node) {
    const stmts = node.body.map(e => e.text)
    if (stmts.length === 0) {
      node.text = `${this.indent}pass`
    } else {
      node.text = this.indent + stmts.join(`\n${this.indent}`)
    }
    this.indentDec()
  }

  leaveMethodDefinition(node) {
    const NL_AFTER_METHOD = '\n'
    const isConstructor = node.kind === 'constructor'
    const methodName = isConstructor ? '__init__' : node.key.text
    const selfAndParams = [{text: 'self'}].concat(node.value.params)
    const params = selfAndParams.map(p => p.text).join(', ')
    node.text = `def ${methodName}(${params}):\n${node.value.body.text}${NL_AFTER_METHOD}`
  }

  leaveFunctionDeclaration(node) {
    const functionName = node.id ? node.id.text : '' 
    const params = node.params.map(p => p.text).join(', ')
    node.text = `def ${functionName}(${params}):\n${node.body.text}\n`
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
    const operator = node.operator === '===' ? '==' : node.operator    
    node.text = `${left} ${operator} ${right}`
  }

  leaveForStatement(node) {
    const forInRange = 'for (var _1 = 0; _2 < _3; _4++) _5'
    const asForInRange = false ||
      (node.init.type === 'VariableDeclaration' && node.init.declarations.length === 1) &&
      ((node.update.type === 'UpdateExpression' && node.update.operator === '++') ||
      (node.update.type === 'AssignmentExpression' && node.update.operator === '+=')) &&
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
${this.indent}${body}
${this.indent2()}${update}`
      return
    }
  }

  leaveIfStatement(node) {
    const optionalAlternate = node.alternate ? `\n${this.indent}else:\n${this.indent}${node.alternate.text}` : ''
    
    node.text = `if ${node.test.text}:
${this.indent}${node.consequent.text}${optionalAlternate}`
  }

  leaveCallExpression(node) {
    const args = node.arguments.map(arg => arg.text)
    const callee = `${node.callee.text}${node.callee.type === 'Super' ? '.__init__' : ''}`
    node.text = `${callee}(${args.join(', ')})`
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

  leaveReturnStatement(node) {
    node.text = `return${node.argument ? ' '+node.argument.text:''}`
  }

  leaveProgram(node) { 
    node.text = node.body.map(e => e.text).join('\n')
  }
}

class BigNumberVisitor {

  leaveNewExpression (ast) {
    if (ast.callee.name !== 'BigN') return
    return ast.arguments[0]
  }

  leaveCallExpression (ast) {
    const patterns = [
      ['BigN._1(_2)', '_1(_2)'],
      ['_1.minus(_2)', '_1 - _2'],
      ['_1.plus(_2)', '_1 + _2'],
      ['_1.times(_2)', '_1 * _2'],
      ['_1.dividedBy(_2)', '_1 / _2'],
    ]
    for (const [from, to] of patterns) {
      const p = new Pattern(from)
      const matches = p.match(ast)
      if (matches) {
        return (new Pattern(to)).apply(matches)
      }
    }
  }
}

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
