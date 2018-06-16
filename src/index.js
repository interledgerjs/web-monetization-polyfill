// TODO: should some of these libraries be deferred too?
const frameCall = require('./frame-call')
const WEB_MONETIZATION_DOMAIN = 'http://webmonetization.sharafian.com:8080'

window.registerWebMonetizationHandler = function registerWebMonetizationHandler (handlerUri, destUri) {
  const dest = encodeURIComponent(destUri || window.location.href)
  const handler = encodeURIComponent(handlerUri)
  window.location = WEB_MONETIZATION_DOMAIN + '/register' +
    '?dest=' + dest +
    '&handler=' + handler
}

window.monetize = window.monetize || {}
window.monetize.createIlpConnection = function createIlpConnection ({
  destinationAccount,
  sharedSecret
}) {
  // mount the iframe to webmonetization.org
  const wmFrame = document.createElement('iframe')
  wmFrame.src = WEB_MONETIZATION_DOMAIN + '/iframe'
  wmFrame.style = 'display:none;'
  document.body.appendChild(wmFrame)

  // retrieve handler URL and remove iframe
  const handler = await frameCall(wmFrame)
  document.body.removeChild(wmFrame)

  // mount handler iframe
  // TODO: can we make this operation async?
  const handlerFrame = document.createElement('iframe')
  wmFrame.src = handler
  wmFrame.style = 'display:none;'
  document.body.appendChild(handlerFrame)

  // TODO: inject stream.js

  return window.monetize._createConnection({
    iframe,
    destinationAccount,
    sharedSecret
  })
}
