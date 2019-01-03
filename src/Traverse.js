'use strict'

class Traverse {

  static traverse (ast, visitor, parent) {
    if (ast == null) return ast

    if (Array.isArray(ast)) {
      return ast.map(elem => Traverse.traverse(elem, visitor, parent))
    }

    if (ast.type === undefined) {
      return ast
    }

    const enter = `enter${ast.type}`
    const leave = `leave${ast.type}`
    visitor.enter && visitor.enter(ast, parent)
    visitor[enter] && visitor[enter](ast, parent)
    
    for (const k of Object.keys(ast)) {
      if (!['type', 'start', 'end'].includes(k))  {
        ast[k] = Traverse.traverse(ast[k], visitor, ast)
      }
    }

    const ret1 = visitor.leave && visitor.leave(ast, parent)
    const ret2 = visitor[leave] && visitor[leave](ast, parent)
    return ret1 || ret2 || ast
  }
}

module.exports = Traverse