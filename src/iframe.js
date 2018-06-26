window.addEventListener('message', receiveMessage, false)

function receiveMessage (event) {
  const id = event.data.id
  const handler = window.localStorage.getItem('handler')

  window.top.postMessage({ id, response: { handler } }, '*')
}
