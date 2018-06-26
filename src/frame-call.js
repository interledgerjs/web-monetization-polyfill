async function frameCall (iframe, data = {}, timeout = 5000) {
  // janky random ID generation
  const id = String(Math.random()).substring(2)

  let timer
  const result = Promise.race([
    new Promise((resolve, reject) => {
      function messageListener (event) {
        if (event.data && typeof event.data === 'object' && event.data.id === id && (event.data.response || event.data.error)) {
          window.removeEventListener('message', messageListener)
          console.log('event.data', event.data)
          if (event.data.response) {
            resolve(event.data.response)
          } else {
            reject(new Error(event.data.error || 'an error occured'))
          }
        }
      }

      window.addEventListener('message', messageListener, false)
    }),
    new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error('request to iframe timed out.' +
          ' id=' + id +
          ' data=' + JSON.stringify(data)))
      }, timeout)
    })
  ])

  iframe.contentWindow.postMessage({ id, request: data }, '*')
  return result
}

module.exports = frameCall
