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
      if (['Identifier', 'MemberExpression'].indexOf(ast.init.type) != -1) {
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
      } else if (ast.init.type === 'CallExpression') {
        const varName = ast.init.callee.type === 'Identifier' ? `${ast.init.callee.name}1`
          : ast.init.callee.type === 'MemberExpression' ? `${ast.init.callee.property.name}`
          : 'tmp'
        ast.id.properties.forEach(property => {
          const oldIdentifier = property.value
          const newIdentifier = {
            type: 'MemberExpression',
            object: {
              type: 'Identifier',
              name: varName
            },
            property: {
              type: 'Identifier',
              name: property.value.name
            },
            computed: false
          }
          Traverse.traverse(this.scopes[this.scopes.length - 1], new RenameVisitor(oldIdentifier, newIdentifier))
        })
        return {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: varName
          },
          init: ast.init,
          kind: ast.kind
        }
      } else {
        throw new Error(`ObjectPatternDestructure: Unsupported init type ${ast.init.type}`)
      }
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