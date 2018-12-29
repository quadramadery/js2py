'use strict'

class RenameVisitor {

  constructor(oldIdentifier, newIdentifier) {
    this.oldIdentifier = oldIdentifier
    this.newIdentifier = newIdentifier
  }

  leaveIdentifier(ast) {
    if (ast.name === this.oldIdentifier.name) {
      return this.newIdentifier // TODO Rename should not apply within MemberExpression
    }
  }
}

module.exports = RenameVisitor