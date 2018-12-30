'use strict'

const Traverse = require('./Traverse')
const RenameVisitor = require('./RenameVisitor')

class ObjectPatternDestructure {

  constructor() {
    this.scopes = []
    this.scopeTypes = [
      'Program',
      'FunctionDeclaration',
      'ClassDeclaration',
      'BlockStatement'
    ]
  }

  enter(ast) {
    if (this.scopeTypes.indexOf(ast.type) === -1) {
      return
    }
    this.scopes.push(ast)
  }

  leave(ast) {
    if (this.scopeTypes.indexOf(ast.type) === -1) {
      return
    }
    this.scopes.pop()
  }

  leaveVariableDeclarator(ast) {
    if (ast.id.type !== 'ObjectPattern') {
      return
    }

    if (ast.id.properties.length === 0) {
      return { type: 'Noop' }
    }
    if (ast.id.properties.length === 1) {
      return {
        type: 'VariableDeclarator',
        id: ast.id.properties[0].value,
        init: {
          type: 'MemberExpression',
          object: ast.init,
          property: {
            type: 'Identifier',
            name: ast.id.properties[0].value.name
          },
          computed: false
        },
        kind: ast.kind
      }
    } else {
      ast.id.properties.forEach(property => {
        const oldIdentifier = property.value
        const newIdentifier = {
          type: 'MemberExpression',
          object: ast.init,
          property: {
            type: 'Identifier',
            name: property.value.name
          },
          computed: false
        }
        Traverse.traverse(this.scopes[this.scopes.length - 1], new RenameVisitor(oldIdentifier, newIdentifier))
      })
      return { type: 'Noop' }
    }
  }

  leaveVariableDeclaration(ast) {
    ast.declarations = ast.declarations.filter(decl => decl.type != 'Noop')
    if (ast.declarations.length === 0 ) {
      return { type: 'Noop' }
    }
  }
}

module.exports = ObjectPatternDestructure