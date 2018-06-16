async function frameCall (iframe, data = {}, timeout = 5000) {
  // janky random ID generation
  const id = String(Math.random()).substring(2)

  let timer
  const result = Promise.race([
    new Promise((resolve, reject) => {
      function messageListener (event) {
        if (event.data && typeof event.data === 'object' && event.data.id === id) {
          window.removeEventListener('message', messageListener)
          if (event.data.data) {
            resolve(event.data.data)
          } else {
            reject(new Error(event.data.error || 'an error occured'))
          }
        }
      }

      window.addEventListener('message', messageListener, false)
    }),
    new Promise((reject) => {
      timer = setTimeout(() => {
        reject(new Error('request to iframe timed out.' +
          ' id=' + id +
          ' data=' + JSON.stringify(data)))
      }, timeout)
    })
  ])

  iframe.postMessage({ id, data })
  return result
}

module.exports = frameCall
