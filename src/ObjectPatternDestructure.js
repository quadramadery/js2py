'use strict'

const Traverse = require('./Traverse')
const RenameVisitor = require('./RenameVisitor')

class ObjectPatternDestructure {

  constructor() {
    this.scope = undefined
  }

  enter(ast) {
    if (this.scope === undefined) {
      this.scope = ast // TODO: rename scope should be variable scope, not entire file
    }
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
        Traverse.traverse(this.scope, new RenameVisitor(oldIdentifier, newIdentifier))
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