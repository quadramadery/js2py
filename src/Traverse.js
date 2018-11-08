'use strict'

class Traverse {

  traverse (ast, visitor) {
    if (ast == null) return

    if (Array.isArray(ast)) {
      ast.map(elem => this.traverse(elem, visitor))
      return
    }

    if (ast.type === undefined) {
      return
    }

    const enter = `enter${ast.type}`
    const leave = `leave${ast.type}`
    visitor.enter && visitor.enter(ast)
    visitor[enter] && visitor[enter](ast)
    
    this.traverse(Object.values(ast), visitor)

    visitor.leave && visitor.leave(ast)
    visitor[leave] && visitor[leave](ast)
  }
}

module.exports = Traverse