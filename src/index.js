// TODO: should some of these libraries be deferred too?
const frameCall = require('./frame-call')
const WEB_MONETIZATION_DOMAIN = 'https://polyfill.webmonetization.org'
// const WEB_MONETIZATION_DOMAIN = 'http://webmonetization.sharafian.com:8080'

function loadElement (el) {
  return new Promise(resolve => el.addEventListener('load', resolve))
}

window.WebMonetization = window.WebMonetization || {}
window.WebMonetization.register = window.WebMonetization.register || function registerWebMonetizationHandler ({ handlerUri, name }) {
  const handler = encodeURIComponent(handlerUri)
  const iframeUrl = WEB_MONETIZATION_DOMAIN + '/register.html' +
    '?handler=' + handler +
    (name ? ('&name=' + encodeURIComponent(name)) : '')

  // TODO: make sure this can't be covered up or clickjacked
  const registerFrame = document.createElement('iframe')
  registerFrame.frameBorder = '0'
  registerFrame.style = 'position:fixed;top:0;left:0;height:100%;width:100%;margin:0;padding:0;z-index:101;'
  registerFrame.src = iframeUrl
  document.body.appendChild(registerFrame)

  return new Promise((resolve, reject) => {
    function confirmOrCancelHandler (ev) {
      if (ev.origin !== WEB_MONETIZATION_DOMAIN) return

      const notification = ev.data.notification
      window.removeEventListener('message', confirmOrCancelHandler)
      document.body.removeChild(registerFrame)
      resolve(notification === 'confirm')
    }

    window.addEventListener('message', confirmOrCancelHandler)
  })
}

window.WebMonetization.isRegistered = window.WebMonetization.isRegistered || async function isRegistered () {
  const isRegisteredFrame = document.createElement('iframe')
  isRegisteredFrame.src = WEB_MONETIZATION_DOMAIN + '/is-registered.html'
  isRegisteredFrame.style = 'display:none;'
  document.body.appendChild(isRegisteredFrame)

  await loadElement(isRegisteredFrame)
  const result = await frameCall(isRegisteredFrame, {})
  document.body.removeChild(isRegisteredFrame)
  return Boolean(result.registered)
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
