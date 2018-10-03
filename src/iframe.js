const frameCall = require('./frame-call')
const debug = require('debug')('web-monetization-polyfill:iframe')

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
  const params = new URLSearchParams(window.location.search)
  const parentOrigin = params.get('origin')
  let handlerOrigin

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
        const fromHandler = window.handlerFrame.contentWindow === event.source
        const expectedOrigin = fromHandler ? handlerOrigin : parentOrigin
        const msgWindow = fromHandler
          ? { contentWindow: window.parent }
          : window.handlerFrame

        if (event.origin !== expectedOrigin) {
          debug('got ILP message from unexpected origin.' +
            ' got=' + event.origin +
            ' expected=' + expectedOrigin)
          return
        }

        const response = await frameCall({
          iframe: msgWindow,
          data: request
        })

        event.source.postMessage({ id, response }, expectedOrigin)
      } else if (method === 'connect') {
        if (event.origin !== parentOrigin) {
          debug('got "connect" message from unexpected origin.' +
            ' got=' + event.origin +
            ' expected=' + parentOrigin)
          return
        }

        const handler = window.localStorage.getItem('handler')

        if (!handler) {
          throw new NoHandlerRegisteredError('No Web Monetization handler has been registered.')
        }

        if (event.source !== window.parent) {
          throw new Error('this frame is not authorized to handle this message')
        }

        handlerOrigin = new URL(handler).origin

        const handlerFrame = document.createElement('iframe')
        window.handlerFrame = handlerFrame

        handlerFrame.src = handler + '?origin=' + encodeURIComponent(parentOrigin)
        handlerFrame.style = 'display:none;'
        document.body.appendChild(handlerFrame)

        await loadElement(handlerFrame)

        event.source.postMessage({ id, response: true }, parentOrigin)
      }
    } catch (e) {
      event.source.postMessage({ id, error: e.message, errorName: e.name }, '*')
    }
  }

  window.addEventListener('message', receiveMessage, false)
}

window.addEventListener('load', load, false)
