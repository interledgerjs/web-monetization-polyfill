const debug = require('debug')('web-monetization-polyfill:frame-call')

async function frameCall (iframe, data = {}, method, timeout = 5000) {
  // janky random ID generation
  const id = String(Math.random()).substring(2)

  let timer
  const result = new Promise((resolve, reject) => {
    function messageListener (event) {
      if (event.data && typeof event.data === 'object' && event.data.id === id && (event.data.response || event.data.error)) {
        window.removeEventListener('message', messageListener)
        clearTimeout(timer)
        if (event.data.response) {
          resolve(event.data.response)
        } else {
          const error = new Error(event.data.error || 'an error occured')
          if (event.data.errorName) {
            error.name = event.data.errorName
          }
          reject(error)
        }
      }
    }

    window.addEventListener('message', messageListener, false)
    timer = setTimeout(() => {
      debug('timed out call. origin=' + window.location.origin)
      window.removeEventListener('message', messageListener)
      reject(new Error('request to iframe timed out.' +
        ' id=' + id +
        ' data=' + JSON.stringify(data)))
    }, timeout)
  })

  const message = { id, request: data }
  if (method) message.method = method

  iframe.contentWindow.postMessage(message, '*')
  return result
}

module.exports = frameCall
