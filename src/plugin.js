const EventEmitter = require('events')
const frameCall = require('./frame-call')
const ILDCP = require('ilp-protocol-ildcp')
const IlpPacket = require('ilp-packet')
const debug = require('debug')('web-monetization-polyfill:plugin')
const cryptoHelper = require('./crypto-polyfill')
const base64url = buf => buf
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\//g, '_')
  .replace(/\+/g, '-')

const WEB_MONETIZATION_DOMAIN = require('./web-monetization-domain')
const ConnectionStates = {
  NOT_CONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2,
  DEAD: 3
}

class PluginIframe extends EventEmitter {
  constructor ({ handlerFrame }) {
    super()

    this.iframe = handlerFrame
    this.connectionState = ConnectionStates.NOT_CONNECTED
    this.plyginId = base64url(cryptoHelper.generateRandomCondition(8))
  }

  async awaitConnectOrDisconnect () {
    if (this.connectionState === ConnectionStates.CONNECTING) {
      return new Promise((resolve, reject) => {
        function onConnect () {
          resolve()
          this.removeListener('disconnect', onDisconnect)
        }

        function onDisconnect () {
          reject(new Error('plugin disconnected'))
          this.removeListener('connect', onConnect)
        }

        this.once('connect', onConnect)
        this.once('disconnect', onDisconnect)
      })
    }

    if (this.connectionState === ConnectionStates.DEAD) {
      throw new Error('plugin has died. id=' + this.pluginId)
    }
  }

  async connect () {
    if (this.connectionState !== ConnectionStates.NOT_CONNECTED) {
      return this.awaitConnectOrDisconnect()
    }

    this.connectionState = ConnectionStates.CONNECTING
    this.messageListener = async (event) => {
      const { id, request } = event.data
      let packetIntendedForUs = false

      if (event.origin !== WEB_MONETIZATION_DOMAIN || !request) {
        return
      }

      if (this.connectionState !== ConnectionStates.CONNECTED) {
        await this.awaitConnectOrDisconnect()
      }

      try {
        const requestBuffer = Buffer.from(request, 'base64')
        const parsed = IlpPacket.deserializeIlpPrepare(requestBuffer)

        // just ignore the packets that aren't for us
        if (!parsed.destination.startsWith(this.ildcp.clientAddress)) {
          return
        } else {
          packetIntendedForUs = true
        }

        const response = await this.handler(requestBuffer)
        this.iframe.contentWindow.postMessage({
          id,
          response: response.toString('base64')
        }, WEB_MONETIZATION_DOMAIN)
      } catch (e) {
        debug('error in handler.' +
          ' pluginId=' + this.pluginId +
          ' error=' + e.stack)

        // clean ourselves up to prevent memory leak
        this.disconnect()

        if (packetIntendedForUs) {
          this.iframe.contentWindow.postMessage({
            id,
            error: e.message
          }, WEB_MONETIZATION_DOMAIN)
        }
      }
    }

    window.addEventListener('message', this.messageListener, false)
    this.ildcp = await ILDCP.fetch(this.sendData.bind(this))
    this.ildcp.clientAddress += '.' + this.pluginId
    this.connectionState = ConnectionStates.CONNECTED
    this.emit('connect')
  }

  async disconnect () {
    window.removeEventListener('message', this.messageListener)
    this.connectionState = ConnectionStates.DEAD
    this.emit('disconnect')
  }

  async isConnected () {
    return this.connectionState === ConnectionStates.CONNECTED
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

    const response = await frameCall({
      iframe: this.iframe,
      data: data.toString('base64'),
      origin: WEB_MONETIZATION_DOMAIN
    })

    return Buffer.from(response, 'base64')
  }
}

module.exports = PluginIframe
