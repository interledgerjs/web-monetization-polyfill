const EventTarget = require('./event-target')
const Events = require('./web-events')

class WebIlpStream extends EventTarget {
  constructor ({ stream }) {
    super()
    this._stream = stream

    this._stream.on('data', data => {
      this.dispatchEvent(Events.IlpDataEvent(data))
    })

    this._stream.on('money', amount => {
      this.dispatchEvent(Events.IlpMoneyEvent(amount))
    })

    this._stream.on('outgoing_money', amount => {
      this.dispatchEvent(Events.IlpOutgoingMoneyEvent(amount))
    })

    this._stream.on('close', () => {
      this.dispatchEvent(Events.IlpCloseEvent())
    })

    this._stream.on('error', e => {
      this.dispatchEvent(Events.IlpErrorEvent(e))
    })
  }

  isOpen () {
    return this._stream.isOpen()
  }

  get id () {
    return this._stream.id
  }

  get receiveMax () {
    return this._stream.receiveMax
  }

  get sendMax () {
    return this._stream.sendMax
  }

  get totalReceived () {
    return this._stream.totalReceived
  }

  get totalSent () {
    return this._stream.totalSent
  }

  receiveTotal (amount, timeout) {
    return this._stream.receiveTotal(amount, timeout)
  }

  sendTotal (amount, timeout) {
    return this._stream.sendTotal(amount, timeout)
  }

  setSendMax (amount) {
    return this._stream.setSendMax(amount)
  }

  setReceiveMax (amount) {
    return this._stream.setReceiveMax(amount)
  }

  close () {
    return this._stream.destroy()
  }

  send (msg) {
    return new Promise((resolve, reject) => {
      this._stream.write(msg, err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

module.exports = WebIlpStream
