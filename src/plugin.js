const EventEmitter = require('events')
const frameCall = require('./frame-call')
const ILDCP = require('ilp-protocol-ildcp')
const IlpPacket = require('ilp-packet')
const crypto = require('crypto')
const base64url = buf => buf
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\//g, '_')
  .replace(/\+/g, '-')

const ConnectionStates = {
  NOT_CONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2
}

class PluginIframe extends EventEmitter {
  constructor ({ handlerFrame }) {
    super()

    this.iframe = handlerFrame
    this.connectionState = ConnectionStates.NOT_CONNECTED
    this.pluginId = base64url(crypto.randomBytes(8))
  }

  async awaitConnectOrDisconnect () {
    if (this.connectionState === ConnectionStates.CONNECTING) {
      new Promise((resolve, reject) => {
        onConnect () {
          resolve()
          this.removeListener('disconnect', onDisconnect)
        }

        onDisconnect () {
          reject(new Error('plugin disconnected'))
          this.removeListener('connect', onConnect)
        }

        this.once('connect', onConnect)
        this.once('disconnect', onDisconnect)
      })
    }
  }

  async connect () {
    if (this.connectionState !== ConnectionStates.NOT_CONNECTED) {
      return this.awaitConnectOrDisconnect()
    }

    this.connectionState = ConnectionStates.CONNECTING
    this.messageListener = async (event) => {
      const { id, request } = event.data
      if (!request) return

      try {
        const requestBuffer = Buffer.from(request, 'base64')
        const parsed = IlpPacket.deserializeIlpPrepare(requestBuffer)

        // just ignore the packets that aren't for us
        if (!parsed.destination.startsWith(this.ildcp.clientAddress)) {
          return
        }

        const response = await this.handler(requestBuffer)
        this.iframe.contentWindow.postMessage({
          id,
          response: response.toString('base64')
        }, '*')
      } catch (e) {
        console.error('error in handler.', e)
        this.iframe.contentWindow.postMessage({
          id,
          error: e.message
        }, '*')
      }
    }

    window.addEventListener('message', this.messageListener, false)
    this.ildcp = await ILDCP.fetch(this.sendData.bind(this))
    this.ildcp.clientAddress += '.' + this.pluginId
    this.connectionState = ConnectionState.CONNECTED
    this.emit('connect')
  }

  async disconnect () {
    window.removeEventListener('message', this.messageListener)
    this.connectionState = ConnectionState.NOT_CONNECTED
    this.emit('disconnect')
  }

  async isConnected () {
    return this.connectionState === ConnectionState.CONNECTED
  }

  registerDataHandler (handler) {
    this.handler = handler
  }

  deregisterDataHandler () {
    delete this.handler
  }

  async sendData (data) {
    if (this.ildcp) {
      const parsed = IlpPacket.deserializeIlpPrepare(data)
      if (parsed.destination === 'peer.config') {
        return ILDCP.serializeIldcpResponse(this.ildcp)
      }
    }

    const response = await frameCall(this.iframe, data.toString('base64'))
    return Buffer.from(response, 'base64')
  }
}

module.exports = PluginIframe
