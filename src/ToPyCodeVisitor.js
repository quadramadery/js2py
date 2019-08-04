'use strict'

class ToPyCodeVisitor {

  constructor() {
    this.DEFAULT_INDENT = '  '
    this.indent = ''
  }

  indentBy(n) {
    return n > 0 ? this.indent + this.DEFAULT_INDENT
         : n < 0 ? this.indent.substring(0, this.indent.length - this.DEFAULT_INDENT.length)
         : this.indent
  }

  indentN(n) {
    let newIndent = ''
    for (let i = 0; i < n; i++) {
      newIndent += this.DEFAULT_INDENT
    }
    return newIndent
  }

  indentBlock(n, text) {
    const relIndent = this.indentN(Math.abs(n))
    const absIndent = this.indentBy(Math.abs(n))
    if (n >= 0) {
      return absIndent + text.split(`\n`).join(`\n${relIndent}`)
    } else {
      return text.replace(absIndent, '').split(`\n${relIndent}`).join(`\n`)
    }
  }

  setIndent(n) {
    this.indent = this.indentBy(n)
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
    node.text = `[ ${elems.join(', ')} ]`
  }

  leaveProperty(node) {
    node.text = `'${node.key.text}': ${node.value.text}`
  }

  enterObjectExpression(node) {
    this.setIndent(+1)
  }

  leaveObjectExpression(node) {
    if (node.properties.length === 0) {
      node.text = '{}'
    } else {
      const properties = node.properties.map(p => p.text).join(`,\n${this.indent}`)
      node.text = `{\n${this.indent}${properties}\n${this.indentBy(-1)}}`
    }
    this.setIndent(-1)
  }

  leaveArrayExpression(node) {
    const elems = node.elements.map(e => e.text)
    node.text = `[${elems.join(', ')}]`
  }

  leaveAssignmentPattern(node) {
    node.text = `${node.left.text} = ${node.right.text}`
  }

  enterClassBody(node) {
    this.setIndent(+1)
  }
  leaveClassBody(node) {
    const stmts = node.body.filter(({type}) => type !== 'Noop').map(e => e.text)
    if (stmts.length === 0) {
      node.text = `${this.indent}pass\n`
    } else {
      node.text = this.indent + stmts.join(`\n${this.indent}`) + '\n'
    }
    this.setIndent(-1)
  }

  enterBlockStatement(node) {
    this.setIndent(+1)
  }
  leaveBlockStatement(node) {
    const stmts = node.body.filter(({type}) => type !== 'Noop').map(e => e.text)
    if (stmts.length === 0) {
      node.text = `${this.indent}pass`
    } else {
      node.text = this.indent + stmts.join(`\n${this.indent}`)
    }
    this.setIndent(-1)
  }

  leaveMethodDefinition(node) {
    const NL_AFTER_METHOD = '\n'
    const isConstructor = node.kind === 'constructor'
    const methodName = isConstructor ? '__init__' : node.key.text
    const selfAndParams = (node.static ? [] : [{text: 'self'}]).concat(node.value.params)
    const params = selfAndParams.map(p => p.text).join(', ')
    node.text = `def ${methodName}(${params}):\n${node.value.body.text}${NL_AFTER_METHOD}`
  }

  leaveFunctionDeclaration(node) {
    const functionName = node.id ? node.id.text : '' 
    const params = node.params.map(p => p.text).join(', ')
    node.text = `def ${functionName}(${params}):\n${node.body.text}\n`
  }

  leaveArrowFunctionExpression(node) {
    if ((node.expression === false) && (node.body.body.length > 1)) {
        throw new Error('Arrow function body has more than one statement')
    }
    const params = node.params.map(p => p.text).join(', ')
    node.text = `lambda ${params}: ${node.body.text}`
  }

  leaveClassDeclaration(n) {
    const superClass = n.superClass ? `(${n.superClass.text})` : ''
    n.text = `class ${n.id.text}${superClass}:
${n.body.text}`
  }

  leaveExpressionStatement(ast) {
    ast.text = ast.expression.text
  }

  leaveUnaryExpression(node) {
    const operators = {
      'delete': 'del ',
      'void': '??',
      'typeof': '??',
      '+': '+',
      '-': '-',
      '~': '??',
      '!': 'not '
    }
    node.text = `${operators[node.operator]}${node.argument.text}`
  }

  leaveBinaryExpression(node) {
    const left = node.left.type === 'BinaryExpression' ? `(${node.left.text})` : node.left.text
    const right = node.right.type === 'BinaryExpression' ? `(${node.right.text})` : node.right.text
    const operator = node.operator === '===' ? '==' : node.operator    
    node.text = `${left} ${operator} ${right}`
  }

  leaveForStatement(node) {
    const asForInRange = false ||
      (node.init !== null && node.init.type === 'VariableDeclaration' && node.init.declarations.length === 1) &&
      ((node.update !== null && node.update.type === 'UpdateExpression' && node.update.operator === '++') ||
      (node.update !== null && node.update.type === 'AssignmentExpression' && node.update.operator === '+=')) &&
      (node.test !== null && node.test.type === 'BinaryExpression')

    if (asForInRange) {
      const id = node.init.declarations[0].id.name
      const low = node.init.declarations[0].init.text
      const high = node.test.right.text
      node.text = `for ${id} in range(${low}, ${high}):\n${node.body.text}`
      return
    } else {
      const init = (node.init && node.init.text) || ""
      const test = (node.test && node.test.text) || "true"
      const update = (node.update && node.update.text) || ""
      const body = node.body.text
      node.text = `${init === "" ? "" : init + "\n"}${this.indent}while ${test}:
${this.indent}${body}${update === "" ? "" : "\n" + this.indentBlock(+1, update)}`
      return
    }
  }

  leaveIfStatement(node) {
    const consequent = node.consequent.type === 'BlockStatement' ? node.consequent.text : this.indentBlock(+1, node.consequent.text)
    const alternate = node.alternate && (node.alternate.type === 'BlockStatement' ? node.alternate.text : this.indentBlock(+1, node.alternate.text))
    const optionalAlternate = node.alternate ? `\n${this.indent}else:\n${alternate}` : ''
    const optionalElIf = node.alternate && (
      (node.alternate.type === 'IfStatement') || 
      (node.alternate.type === 'BlockStatement' && 
       node.alternate.body.length === 1 && 
       node.alternate.body[0].type === 'IfStatement')) ? `\n${this.indent}el${this.indentBlock(-1, alternate)}` : ''


    node.text = `if ${node.test.text}:
${consequent}${optionalElIf || optionalAlternate}`
  }

  leaveConditionalExpression(node) {
    node.text = `${node.consequent.text} if ${node.test.text} else ${node.alternate.text}`
  }

  leaveLogicalExpression(node) {
    const operator = {
      '||': 'or',
      '&&': 'and',
    }[node.operator]
    node.text = `${node.left.text} ${operator} ${node.right.text}`
  }

  leaveCallExpression(node) {
    const args = node.arguments.map(arg => arg.text)
    const callee = `${node.callee.text}${node.callee.type === 'Super' ? '.__init__' : ''}`
    node.text = `${callee}(${args.join(', ')})`
  }

  leaveMemberExpression(node) {
    if (node.computed) {
      node.text =  `${node.object.text}[${node.property.text}]`
    } else {
      node.text = `${node.object.text}.${node.property.text}`
    }
  }

  leaveNewExpression(node) {
    const args = node.arguments.map(arg => arg.text)
    node.text = `${node.callee.text}(${args.join(', ')})`
  }

  leaveAssignmentExpression(node) {
    node.text = `${node.left.text} ${node.operator} ${node.right.text}`    
  }

  leaveVariableDeclarator(node) {
    node.text = node.init ? `${node.id.text} = ${node.init.text}` : ''
  }

  leaveTemplateLiteral(node) {
    const fmtString = "'" + node.quasis.map(q => q.value.raw).join('%f') + "'" // TODO infer type
    const exprs = node.expressions.map(expr => expr.text).join(', ')
    node.text = exprs.length === 0 ? fmtString : `${fmtString} % (${exprs})` 
  }

  leaveVariableDeclaration(node) {
    const decls = node.declarations.map(e => e.text)
    node.text = decls.join('\n')
  }

  leaveReturnStatement(node) {
    node.text = `return${node.argument ? ' '+node.argument.text:''}`
  }

  leaveImportDefaultSpecifier(node) {
    node.text = node.local.text
  }

  leaveImportDeclaration(node) {
    let packageName = node.source.text.substring(1, node.source.text.length - 1)
    if (/^\./.test(packageName)) packageName = packageName.replace('./', 'bfxhfindicators.') // TODO move out
    node.text = `from ${packageName} import ${node.specifiers[0].text}`
  }

  leaveProgram(node) { 
    node.text = node.body.filter(({type}) => type !== 'Noop').map(e => e.text).join('\n')
  }
}

module.exports = ToPyCodeVisitor
