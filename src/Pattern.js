'use strict'

const espree = require('espree')
const Traverse = require('./Traverse')

class Pattern {
  constructor(
    patternOrString, 
    {matchStatement} = {matchStatement: false}
  ) {
    if (typeof patternOrString === 'string') {
      const ast = espree.parse(patternOrString, {
        ecmaVersion: 8,
        sourceType: 'module'
      })
      this.ast = !matchStatement && ast.body[0].expression || ast.body[0]
    } else {
      this.ast = patternOrString
    }

    this.type = this.ast.type
  }

  isVar(name) {
    return /^_[0-9]+/.test(name)
  }

  apply (matches) {
    const changesStack = []
    this.ast = Traverse.traverse(this.ast, {
      leave: (ast, parent) => {
        changesStack.map(([obj, attr, newVal]) => {
          if (obj === ast) {
            ast[attr] = newVal
          }
        })

        if (this.isVar(ast.name)) {
          return this.applyVar(ast.name, ast, parent, matches, changesStack)
        }
      }
    })

    return this.ast
  }

  applyVar(varName, ast, parent, matches, changesStack) {
    const v = varName.replace(/^(_[0-9]+).*/, '$1')
    const path = v === varName ? [] : varName.replace(/^_[0-9]+/, '').split('_')
    if (path.length == 0) {
      return matches[v]
    } else {
      if (path.length === 1) {
        changesStack.push([parent, path[0], matches[v]])
      }
      return ast
    }
  }

  match (ast) {
    const changesStack = []
    this.ast = Traverse.traverse(this.ast, {
      leave: (ast, parent) => {
        delete ast.start
        delete ast.end
        if (this.isVar(ast.name)) {
          this.matchVar(ast.name, ast, parent, changesStack)
        }

        changesStack.map(([obj, attr, newVal]) => {
          if (obj === ast) {
            ast[attr] = newVal;
          }
        })
      }
    })

    const matches = {}
    const match = this._match(this.ast, ast, matches)
    return match ? matches : false
  }

  matchVar(varName, ast, parent, changesStack) {
    const v = varName.replace(/^(_[0-9]+).*/, '$1')
    const path = v === varName ? [] : varName.replace(/^_[0-9]+/, '').split('_')
    if (path.length == 0) {
      ast.wildcard = true
    } else if (path.length === 1) {
      changesStack.push([parent, path[0], {
        type: 'Identifier',
        name: v,
        wildcard: true
      }])
    }
  }

  _match (a, b, matches) {
    if (a === null && b === null) {
      return true
    } else if (a.wildcard) {
      matches[a.name] = b
      return true
    } else if (a.type != undefined && b != undefined && a.type === b.type) { 
      for (const k in a) {
        if (['type', 'start', 'end'].includes(k)) continue
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
      return a === b
    }
  }
}

module.exports = Pattern
