// TODO: should some of these libraries be deferred too?
const frameCall = require('./frame-call')
const WEB_MONETIZATION_DOMAIN = 'https://polyfill.webmonetization.org'
// const WEB_MONETIZATION_DOMAIN = 'http://webmonetization.sharafian.com:8080'

function loadElement (el) {
  return new Promise(resolve => el.addEventListener('load', resolve))
}

window.WebMonetization = window.WebMonetization || {}
window.WebMonetization.register = function registerWebMonetizationHandler ({ handlerUri, destUri, cancelUri, name }) {
  const dest = encodeURIComponent(destUri || window.location.href)
  const handler = encodeURIComponent(handlerUri)
  window.location = WEB_MONETIZATION_DOMAIN + '/register.html' +
    '?dest=' + dest +
    (cancelUri ? ('&cancel=' + encodeURIComponent(cancelUri)) : '') +
    (name ? ('&name=' + encodeURIComponent(name)) : '') +
    '&handler=' + handler
}

window.WebMonetization.monetize = window.WebMonetization.monetize || async function createIlpConnection ({
  destinationAccount,
  sharedSecret
}) {
  if (window.WebMonetization._createConnection) {
    const wmFrame = window.WebMonetization._wmFrame
    return window.WebMonetization._createConnection({
      handlerFrame: wmFrame,
      destinationAccount,
      sharedSecret
    })
  }

  // mount the iframe to webmonetization.org
  const wmFrame = document.createElement('iframe')
  window.WebMonetization._wmFrame = wmFrame
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
  return window.WebMonetization._createConnection({
    handlerFrame: wmFrame,
    destinationAccount,
    sharedSecret
  })
}
