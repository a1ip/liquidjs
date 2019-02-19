import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'

const expect = chai.expect
chai.use(sinonChai)

const P = require('src/util/promise')

describe('util/promise', function () {
  describe('.anySeries()', function () {
    it('should resolve in series', function () {
      const spy1 = sinon.spy()
      const spy2 = sinon.spy()
      return P
        .anySeries(
          ['first', 'second'],
          (item, idx) => new Promise(function (resolve, reject) {
            if (idx === 0) {
              setTimeout(function () {
                spy1()
                reject(new Error('first cb'))
              }, 10)
            } else {
              spy2()
              resolve('foo')
            }
          }))
        .then(() => expect(spy2).to.have.been.calledAfter(spy1))
    })
    it('should reject when all rejected', function () {
      const p = P.anySeries(['first', 'second', 'third'],
        item => Promise.reject(new Error(item)))
      return expect(p).to.be.rejectedWith('third')
    })
    it('should resolve the value that first callback resolved', async () => {
      const result = await P.anySeries(
        ['first', 'second'],
        item => Promise.resolve(item)
      )
      return expect(result).to.equal('first')
    })
    it('should not call rest of callbacks once resolved', () => {
      const spy = sinon.spy()
      return P
        .anySeries(['first', 'second'], (item, idx) => {
          if (idx > 0) {
            spy()
          }
          return Promise.resolve(item)
        })
        .then(() => expect(spy).to.not.have.been.called)
    })
  })
  describe('.mapSeries()', async function () {
    it('should resolve when all resolved', async function () {
      const result = await P.mapSeries(
        ['first', 'second', 'third'],
        item => Promise.resolve(item)
      )
      return expect(result).to.deep.equal(['first', 'second', 'third'])
    })
    it('should reject with the error that first callback rejected', () => {
      const p = P.mapSeries(['first', 'second'],
        item => Promise.reject(item))
      return expect(p).to.rejectedWith('first')
    })
    it('should resolve in series', function () {
      const spy1 = sinon.spy()
      const spy2 = sinon.spy()
      return P
        .mapSeries(
          ['first', 'second'],
          (item, idx) => new Promise(function (resolve) {
            if (idx === 0) {
              setTimeout(function () {
                spy1()
                resolve('first cb')
              }, 10)
            } else {
              spy2()
              resolve('foo')
            }
          }))
        .then(() => expect(spy2).to.have.been.calledAfter(spy1))
    })
    it('should not call rest of callbacks once rejected', () => {
      const spy = sinon.spy()
      return P
        .mapSeries(['first', 'second'], (item, idx) => {
          if (idx > 0) {
            spy()
          }
          return Promise.reject(new Error(item))
        })
        .catch(() => expect(spy).to.not.have.been.called)
    })
  })
})
