// TODO: should some of these libraries be deferred too?
const frameCall = require('./frame-call')
const WEB_MONETIZATION_DOMAIN = 'https://polyfill.webmonetization-test.com'

function loadElement (el) {
  return new Promise(resolve => el.addEventListener('load', resolve))
}

window.registerWebMonetizationHandler = function registerWebMonetizationHandler (handlerUri, destUri) {
  const dest = encodeURIComponent(destUri || window.location.href)
  const handler = encodeURIComponent(handlerUri)
  window.location = WEB_MONETIZATION_DOMAIN + '/register' +
    '?dest=' + dest +
    '&handler=' + handler
}

window.monetize = window.monetize || {}
window.monetize.createIlpConnection = async function createIlpConnection ({
  destinationAccount,
  sharedSecret
}) {
  // mount the iframe to webmonetization.org
  const wmFrame = document.createElement('iframe')
  wmFrame.src = WEB_MONETIZATION_DOMAIN + '/iframe'
  wmFrame.style = 'display:none;'
  document.body.appendChild(wmFrame)
  await loadElement(wmFrame)

  // retrieve handler URL and remove iframe
  console.log('sending the call')
  const { handler } = await frameCall(wmFrame)
  document.body.removeChild(wmFrame)
  console.log('got handler URL:', handler)

  // mount handler iframe
  const handlerFrame = document.createElement('iframe')
  handlerFrame.src = handler
  handlerFrame.style = 'display:none;'
  document.body.appendChild(handlerFrame)

  // pull in the STREAM library
  const streamScript = document.createElement('script')
  streamScript.src = WEB_MONETIZATION_DOMAIN + '/stream'
  document.body.appendChild(streamScript)

  await Promise.all([
    loadElement(handlerFrame),
    loadElement(streamScript)
  ])

  // clean up the script element and init connection
  document.body.removeChild(streamScript)
  return window.monetize._createConnection({
    handlerFrame,
    destinationAccount,
    sharedSecret
  })
}
