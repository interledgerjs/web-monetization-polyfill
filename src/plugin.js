const frameCall = require('./frame-call')

class PluginIframe {
  constructor ({ handlerFrame }) {
    this.iframe = handlerFrame
  }

  async connect () {
    window.addEventListener('message', async (event) => {
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
    }, false)
  }

  async disconnect () {
  }

  async isConnected () {
    return true
  }

  registerDataHandler (handler) {
    this.handler = handler
  }

  async sendData (data) {
    while (true) {
      try {
        const response = await frameCall(this.iframe, data.toString('base64'))
        return Buffer.from(response, 'base64')
      } catch (e) {
        console.error(e)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }
}

module.exports = PluginIframe
