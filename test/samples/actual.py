'use strict'
Indicator = require('./indicator')
BigN = require('bignumber.js')
class AccumulativeSwingIndex(Indicator):
  def __init__(self, ):
    [ limitMoveValue ] = args
    super().__init__()
    self._lmv = limitMoveValue
    self._prevCandle = None
  def unserialize(self, ):
    return AccumulativeSwingIndex(args)
  def calcSI(self, candle, prevCandle, _lmv):
    if _lmv == 0:
          return 0
    lmv = _lmv
    open = candle.open
    high = candle.high
    low = candle.low
    close = candle.close
    prevClose = prevCandle.close
    prevOpen = prevCandle.open
    k = max([ high - prevClose, prevClose - low ])
    tr = max([ k, high - low ])
    sh = prevClose - prevOpen
    er = 0
    if prevClose > high:
          er = high - prevClose
    else:
    if prevClose < low:
          er = prevClose - low
    r = (tr - (er * 0.5)) + (sh * 0.25)
    if r.isEqualTo(0):
          return 0
    siNum = ((close - prevClose) + ((close - open) * 0.5)) + ((prevClose - prevOpen) * 0.25)
    si = ((k / lmv) * 50) * (siNum / r)
    return si.toNumber()
  def reset(self):
    super().reset()
    self._prevCandle = None
  def update(self, candle):
    if self._prevCandle == None:
          return super().update(0)
    si = AccumulativeSwingIndex.calcSI(candle, self._prevCandle, self._lmv)
    return super().update(self.prev() + si)
  def add(self, candle):
    if self._prevCandle == None:
          super().add(0)
      self._prevCandle = candle
      return
    si = AccumulativeSwingIndex.calcSI(candle, self._prevCandle, self._lmv)
    super().add(self.v() + si)
    self._prevCandle = candle
    return self.v()

AccumulativeSwingIndex.id = 'asi'
AccumulativeSwingIndex.label = 'ASI'
AccumulativeSwingIndex.humanLabel = 'Accumulative Swing Index'
AccumulativeSwingIndex.ui = undefined
AccumulativeSwingIndex.args = [  ]
module.exports = AccumulativeSwingIndex