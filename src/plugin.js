const frameCall = require('./frame-call')

class PluginIframe {
  constructor ({ handlerFrame }) {
    this.iframe = handlerFrame
    this.connected = false
  }

  async connect () {
    this.messageListener = async (event) => {
      const { id, request } = event.data
      if (!request) return

      try {
        const response = await this.handler(Buffer.from(request, 'base64'))
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
