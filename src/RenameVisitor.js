'use strict'

class RenameVisitor {

  constructor(oldIdentifier, newIdentifier) {
    this.oldIdentifier = oldIdentifier
    this.newIdentifier = newIdentifier
  }

  leaveIdentifier(ast, parent) {
    if ((parent != null) && (parent.type === 'MemberExpression') && !parent.computed) {
      return
    }
    if (ast.name === this.oldIdentifier.name) {
      return this.newIdentifier
    }
  }
}

module.exports = RenameVisitor