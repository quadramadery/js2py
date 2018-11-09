'use strict'

class Traverse {

  static traverse (ast, visitor) {
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

    const ret1 = visitor.leave && visitor.leave(ast)
    const ret2 = visitor[leave] && visitor[leave](ast)
    return ret1 || ret2 || ast
  }
}

module.exports = Traverse