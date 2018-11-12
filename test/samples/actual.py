'use strict'
Indicator = require('./indicator')
BigN = require('bignumber.js')
class AccumulativeSwingIndex(Indicator):
  def __init__():
    [ limitMoveValue ] = args
    super().__init__()
    self._lmv = limitMoveValue
    self._prevCandle = null
  def unserialize():
    
  def calcSI(candle, prevCandle, _lmv):
    if _lmv == 0:
          
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
          
    siNum = ((close - prevClose) + ((close - open) * 0.5)) + ((prevClose - prevOpen) * 0.25)
    si = ((k / lmv) * 50) * (siNum / r)
    
  def reset():
    super().reset()
    self._prevCandle = null
  def update(candle):
    if self._prevCandle == null:
          
    si = AccumulativeSwingIndex.calcSI(candle, self._prevCandle, self._lmv)
    
  def add(candle):
    if self._prevCandle == null:
          super().add(0)
      self._prevCandle = candle
      
    si = AccumulativeSwingIndex.calcSI(candle, self._prevCandle, self._lmv)
    super().add(self.v() + si)
    self._prevCandle = candle
    

AccumulativeSwingIndex.id = 'asi'
AccumulativeSwingIndex.label = 'ASI'
AccumulativeSwingIndex.humanLabel = 'Accumulative Swing Index'
AccumulativeSwingIndex.ui = undefined
AccumulativeSwingIndex.args = [  ]
module.exports = AccumulativeSwingIndex