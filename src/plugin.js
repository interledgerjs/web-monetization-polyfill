const frameCall = require('./frame-call')
const ILDCP = require('ilp-protocol-ildcp')
const IlpPacket = require('ilp-packet')
const crypto = require('crypto')
const base64url = buf => buf
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\//g, '_')
  .replace(/\+/g, '-')

class PluginIframe {
  constructor ({ handlerFrame }) {
    this.iframe = handlerFrame
    this.connected = false
    this.pluginId = base64url(crypto.randomBytes(8))
  }

  async connect () {
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
    this.connected = true
  }

  async disconnect () {
    window.removeEventListener('message', this.messageListener)
    this.connected = false
  }

  async isConnected () {
    return this.connected
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

    while (true) {
      try {
        const response = await frameCall(this.iframe, data.toString('base64'))
        return Buffer.from(response, 'base64')
      } catch (e) {
        // TODO: should this just end finally and let STREAM handle it?
        console.error(e)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
}

module.exports = PluginIframe
