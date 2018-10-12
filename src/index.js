const WEB_MONETIZATION_DOMAIN = require('./web-monetization-domain')

function loadElement (el) {
  return new Promise(resolve => el.addEventListener('load', resolve))
}

async function loadFrameCallScript () {
  if (window.WebMonetizationPolyfill.frameCall) {
    return window.WebMonetizationPolyfill.frameCall
  }

  const frameCallScript = document.createElement('script')
  frameCallScript.src = WEB_MONETIZATION_DOMAIN + '/frame-call.js'
  document.body.appendChild(frameCallScript)

  await loadElement(frameCallScript)
  document.body.removeChild(frameCallScript)
  return window.WebMonetizationPolyfill.frameCall
}

window.WebMonetizationPolyfill = {}
window.WebMonetizationPolyfill.register = function registerWebMonetizationHandler ({ handlerUri, name }) {
  const handler = encodeURIComponent(handlerUri)
  const iframeUrl = WEB_MONETIZATION_DOMAIN + '/register.html' +
    '?handler=' + handler +
    '&origin=' + encodeURIComponent(window.location.origin) +
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

window.WebMonetizationPolyfill.isRegistered = async function isRegistered () {
  const isRegisteredFrame = document.createElement('iframe')
  isRegisteredFrame.src = WEB_MONETIZATION_DOMAIN + '/is-registered.html'
  isRegisteredFrame.style = 'display:none;'
  document.body.appendChild(isRegisteredFrame)

  await loadElement(isRegisteredFrame)
  const frameCall = await loadFrameCallScript()
  const result = await frameCall({
    iframe: isRegisteredFrame,
    data: {},
    origin: WEB_MONETIZATION_DOMAIN
  })

  document.body.removeChild(isRegisteredFrame)
  return Boolean(result.registered)
}

window.WebMonetizationPolyfill.monetize = async function createIlpConnection ({
  destinationAccount,
  sharedSecret
}) {
  if (window.WebMonetizationPolyfill.createConnection) {
    const wmFrame = window.WebMonetizationPolyfill.wmFrame
    return window.WebMonetizationPolyfill.createConnection({
      handlerFrame: wmFrame,
      destinationAccount,
      sharedSecret
    })
  }

  // load frame call util
  const frameCall = await loadFrameCallScript()

  // mount the iframe to webmonetization.org
  const wmFrame = document.createElement('iframe')
  window.WebMonetizationPolyfill.wmFrame = wmFrame
  wmFrame.src = WEB_MONETIZATION_DOMAIN + '/iframe.html' +
    '?origin=' + encodeURIComponent(window.location.origin)
  wmFrame.style = 'display:none;'
  document.body.appendChild(wmFrame)

  // pull in the STREAM library
  const streamScript = document.createElement('script')
  streamScript.src = WEB_MONETIZATION_DOMAIN + '/stream.js'
  document.body.appendChild(streamScript)

  const prepareHandler = async () => {
    await loadElement(wmFrame)
    await frameCall({
      iframe: wmFrame,
      data: {},
      method: 'connect',
      origin: WEB_MONETIZATION_DOMAIN
    })
  }

  // load STREAM while loading wmFrame and handler
  await Promise.all([
    prepareHandler(),
    loadElement(streamScript)
  ])

  // clean up the script element and init connection
  document.body.removeChild(streamScript)
  return window.WebMonetizationPolyfill.createConnection({
    handlerFrame: wmFrame,
    destinationAccount,
    sharedSecret
  })
}

window.WebMonetization = window.WebMonetization || {}
window.WebMonetization.register = window.WebMonetization.register || window.WebMonetizationPolyfill.register
window.WebMonetization.isRegistered = window.WebMonetization.isRegistered || window.WebMonetizationPolyfill.isRegistered
window.WebMonetization.monetize = window.WebMonetization.monetize || window.WebMonetizationPolyfill.monetize
