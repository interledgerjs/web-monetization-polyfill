const frameCall = require('./frame-call')

function loadElement (el) {
  return new Promise(resolve => el.addEventListener('load', resolve))
}

class NoHandlerRegisteredError extends Error {
  constructor (...args) {
    super(...args)
    this.name = 'NoHandlerRegisteredError'
  }
}

function load () {
  async function receiveMessage (event) {
    const { id, method, request, response, error } = event.data

    if (response || error) {
      return
    }

    try {
      // default call is ILP packet
      if (!method) {
        if (!window.handlerFrame) {
          throw new Error('No Web Monetization handler has been loaded.')
        }

        // forward to the frame that didn't send the message
        const msgWindow = (window.handlerFrame.contentWindow === event.source)
          ? { contentWindow: window.top }
          : window.handlerFrame

        const response = await frameCall(msgWindow, request)
        event.source.postMessage({ id, response }, '*')
      } else if (method === 'connect') {
        const handler = window.localStorage.getItem('handler')
        if (!handler) {
          throw new NoHandlerRegisteredError('No Web Monetization handler has been registered.')
        }

        if (event.source !== window.top) {
          throw new Error('this frame is not authorized to handle this message')
        }

        const handlerFrame = document.createElement('iframe')
        window.handlerFrame = handlerFrame

        handlerFrame.src = handler
        handlerFrame.style = 'display:none;'
        document.body.appendChild(handlerFrame)

        await loadElement(handlerFrame)

        event.source.postMessage({ id, response: true }, '*')
      }
    } catch (e) {
      event.source.postMessage({ id, error: e.message, errorName: e.name }, '*')
    }
  }

  window.addEventListener('message', receiveMessage, false)
}

window.addEventListener('load', load, false)
