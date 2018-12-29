'use strict'

const Pattern = require('./Pattern')
const Traverse = require('./Traverse')

class ObjectPatternDestructure {

  constructor() {
  }

  leaveVariableDeclarator(ast) {
    if ((ast.id.type === 'ObjectPattern') && (ast.id.properties.length === 1)) {
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
    }
  }
}

module.exports = ObjectPatternDestructure