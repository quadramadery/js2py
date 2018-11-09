'use strict'

const espree = require('espree')
const Traverse = require('./Traverse')

class Pattern {
  constructor(pattern) {
    const ast = espree.parse(pattern, {
      ecmaVersion: 6,
    })
    this.ast = ast.body[0];
  }

  apply (matches) {
    Traverse.traverse(this.ast, {
      leave: (ast) => 
        (ast.type === 'Identifier' && ast.name.startsWith('_') && matches[ast.name])
         ? matches[ast.name]
         : ast
    })

    return this.ast
  }

  match (ast) {
    Traverse.traverse(this.ast, {
      leave: (ast) => {
        delete ast.start
        delete ast.end
        if (ast.type === 'Identifier' && ast.name.startsWith('_')) {
          ast.wildcard = true
        }
        return ast
      }
    })

    const matches = {}
    const match = this._match(this.ast, ast, matches)
    return match ? matches : false
  }

  _match (a, b, matches) {
    if (a === null && b === null) {
      return true
    } else if (a.wildcard) {
      matches[a.name] = b
      return true
    } else if (a.type != undefined && a.type === b.type) { 
      for (const k in a) {
        if (['type'].includes(k)) continue
        if (!this._match(a[k], b[k], matches)) {
          return false
        }
      }
      return true
    } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
      for (let i = 0; i < a.length; i++) {
        if (!this._match(a[i], b[i], matches)) {
          return false
        }
      }
      return true
    } else {
      return true
    }
  }
}

module.exports = Pattern
