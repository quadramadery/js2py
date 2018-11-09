'use strict'

class Traverse {

  traverse (ast, visitor) {
    if (ast == null) return ast

    if (Array.isArray(ast)) {
      return ast.map(elem => this.traverse(elem, visitor))
    }

    if (ast.type === undefined) {
      return ast
    }

    const enter = `enter${ast.type}`
    const leave = `leave${ast.type}`
    visitor.enter && visitor.enter(ast)
    visitor[enter] && visitor[enter](ast)
    
    for (const k of Object.keys(ast)) {
      ast[k] = this.traverse(ast[k], visitor)
    }

    visitor.leave && visitor.leave(ast)
    const ret = visitor[leave] && visitor[leave](ast)
    return ret || ast
  }
}

module.exports = Traverse