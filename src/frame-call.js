async function frameCall (iframe, data = {}, method, timeout = 5000) {
  // janky random ID generation
  const id = String(Math.random()).substring(2)

  let timer
  const result = new Promise((resolve, reject) => {
    function messageListener (event) {
      console.log('GOT PACKET IN FRAME CALL HANDLER', id, event.data)
      if (event.data && typeof event.data === 'object' && event.data.id === id && (event.data.response || event.data.error)) {
        window.removeEventListener('message', messageListener)
        clearTimeout(timer)
        console.log('event.data', event.data)
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
      console.log('timed out call. origin=' + window.location.origin)
      window.removeEventListener('message', messageListener)
      reject(new Error('request to iframe timed out.' +
        ' id=' + id +
        ' data=' + JSON.stringify(data)))
    }, timeout)
  })

  const message = { id, request: data }
  if (method) message.method = method

  console.log('SENDING REQUEST', id, window.location.origin)
  iframe.contentWindow.postMessage(message, '*')
  return result
}

module.exports = frameCall
