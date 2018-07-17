// TODO: should some of these libraries be deferred too?
const frameCall = require('./frame-call')
const WEB_MONETIZATION_DOMAIN = 'https://polyfill.webmonetization.org'

function loadElement (el) {
  return new Promise(resolve => el.addEventListener('load', resolve))
}

window.registerWebMonetizationHandler = function registerWebMonetizationHandler ({ handlerUri, destUri, cancelUri, name }) {
  const dest = encodeURIComponent(destUri || window.location.href)
  const handler = encodeURIComponent(handlerUri)
  window.location = WEB_MONETIZATION_DOMAIN + '/register.html' +
    '?dest=' + dest +
    (cancelUri ? ('&cancel=' + encodeURIComponent(cancelUri)) : '') +
    (name ? ('&name=' + encodeURIComponent(name)) : '') +
    '&handler=' + handler
}

window.monetize = window.monetize || {}
window.monetize.createIlpConnection = async function createIlpConnection ({
  destinationAccount,
  sharedSecret
}) {
  if (window.monetize._createConnection) {
    const wmFrame = window.monetize._wmFrame
    return window.monetize._createConnection({
      handlerFrame: wmFrame,
      destinationAccount,
      sharedSecret
    })
  }

  // mount the iframe to webmonetization.org
  const wmFrame = document.createElement('iframe')
  window.monetize._wmFrame = wmFrame
  wmFrame.src = WEB_MONETIZATION_DOMAIN + '/iframe.html'
  wmFrame.style = 'display:none;'
  document.body.appendChild(wmFrame)

  // pull in the STREAM library
  const streamScript = document.createElement('script')
  streamScript.src = WEB_MONETIZATION_DOMAIN + '/stream.js'
  document.body.appendChild(streamScript)

  const prepareHandler = async () => {
    await loadElement(wmFrame)
    await frameCall(wmFrame, {}, 'connect')
  }

  // load STREAM while loading wmFrame and handler
  await Promise.all([
    prepareHandler(),
    loadElement(streamScript)
  ])

  // clean up the script element and init connection
  document.body.removeChild(streamScript)
  return window.monetize._createConnection({
    handlerFrame: wmFrame,
    destinationAccount,
    sharedSecret
  })
}
