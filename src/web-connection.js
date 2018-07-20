const EventTarget = require('./event-target')
const WebIlpStream = require('./web-stream')
const Events = require('./web-events')

// TODO: figure out which events to emit
class WebIlpConnection extends EventTarget {
  constructor ({ connection }) {
    super()
    this._connection = connection

    this._connection.on('error', e => {
      this.dispatchEvent(Events.IlpErrorEvent(e))
    })

    this._connection.on('close', () => {
      this.dispatchEvent(Events.IlpCloseEvent()) 
    })

    this._connection.on('stream', stream => {
      const webStream = new WebIlpStream({ stream })
      this.dispatchEvent(Events.IlpStreamEvent(webStream))
    })
  }

  createStream () {
    const stream = this._connection.createStream()
    return new WebIlpStream({ stream })
  }

  get connectionTag () {
    return this._connection.connectionTag
  }

  get lastPacketExchangeRate () {
    return this._connection.lastPacketExchangeRate
  }

  get minimumAcceptableExchangeRate () {
    return this._connection.minimumAccessibleExchangeRate
  }

  get totalDelivered () {
    return this._connection.totalDelivered
  }

  get totalReceived () {
    return this._connection.totalReceived
  }

  get totalSent () {
    return this._connection.totalSent
  }

  close () {
    return this._connection.end()
  }
}

module.exports = WebIlpConnection
