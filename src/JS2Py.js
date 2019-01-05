'use strict'

const espree = require('espree')
const Traverse = require('./Traverse')
const BigNumberVisitor = require('./BigNumberVisitor')
const ApplyPatternsVisitor = require('./ApplyPatternsVisitor')
const JSVisitor = require('./JSVisitor')
const inlineStaticClassAttrs = require('./InlineStaticClassAttrs')
const ObjectPatternDestructure = require('./ObjectPatternDestructure')
const ToPyCodeVisitor = require('./ToPyCodeVisitor')

class JS2Py {

  convert(code) {
    const ast = espree.parse(code, {
      ecmaVersion: 8,
      sourceType: 'module'
    })
    Traverse.traverse(ast, new ObjectPatternDestructure())
    Traverse.traverse(ast, new BigNumberVisitor())

    const math = new ApplyPatternsVisitor([
      ['Math.max(_1arguments)', 'max([_1elements])'],
      ['Math.min(_1arguments)', 'min([_1elements])'],
      ['Math.exp(_1)', 'exp(_1)'],
      ['Math.pow(_1)', 'pow(_1)'],
      ['Math.abs(_1)', 'abs(_1)'],
    ])
    Traverse.traverse(ast, math)

    const bigNumber = new ApplyPatternsVisitor([
      ['BigN._1(_2)', '_1(_2)'],
      ['_1.minus(_2)', '_1 - _2'],
      ['_1.plus(_2)', '_1 + _2'],
      ['_1.times(_2)', '_1 * _2'],
      ['_1.dividedBy(_2)', '_1 / _2'],
      ['_1.isEqualTo(_2)', '_1 == _2'],
      ['_1.toNumber()', '_1'],
      ["const _1 = require('bignumber.js')", {type: 'Noop'}],
    ])
    Traverse.traverse(ast, bigNumber)

    const arrays = new ApplyPatternsVisitor([
      ['(_1).length', 'len(_1)'],
      ['_1.push(_2)', '_1.append(_2)'],
      ['_1.splice(_2, 1)', 'delete _1[_2]'],
      ['_1[len(_2) - _3]', '_1[-_3]'],
      ['_1.map(_2)', 'map(_2, _1)'],
      ['_1.filter(_2)', 'filter(_2, _1)'],
    ])
    Traverse.traverse(ast, arrays)

    const lodash = new ApplyPatternsVisitor([
      ['_isEmpty(_1)', 'len(_1) === 0'], // TODO restrict to lodash.isEmpty
      ['_isFinite(_1)', 'isfinite(_1)'], // TODO restrict to lodash.isFinite
      ['_max(_1)', 'max(_1)'], // TODO restrict to lodash.max
      ['_min(_1)', 'min(_1)'], // TODO restrict to lodash.min
      ['_sum(_1)', 'sum(_1)'], // TODO restrict to lodash.sum
      ["const _1 = require('lodash/isFinite')", "const isfinite = require('math')"],
      ["const _1 = require('lodash/isEmpty')", {type: 'Noop'}],
      ["const _1 = require('lodash/min')", {type: 'Noop'}],
      ["const _1 = require('lodash/max')", {type: 'Noop'}],
      ["const _1 = require('lodash/sum')", {type: 'Noop'}],
    ])
    Traverse.traverse(ast, lodash)
    Traverse.traverse(ast, new JSVisitor())
    inlineStaticClassAttrs(ast)
    
    const toText = new ToPyCodeVisitor()
    Traverse.traverse(ast, toText)
    return ast.text
  }
}

module.exports = JS2Py
