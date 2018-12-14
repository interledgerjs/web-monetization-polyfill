const { createConnection } = require('ilp-protocol-stream')
const WebIlpConnection = require('./web-connection')
const Plugin = require('./plugin')

window.WebMonetizationPolyfill = window.WebMonetizationPolyfill || {}
window.WebMonetizationPolyfill.createConnection = async function ({
  handlerFrame,
  destinationAccount,
  sharedSecret,
  minExchangeRatePrecision,
  slippage
}) {
  // is there a way to do this w/out buffer/crypto
  const _sharedSecret = Buffer.from(sharedSecret, 'base64')
  const plugin = new Plugin({ handlerFrame })
  const connection = await createConnection({
    plugin,
    destinationAccount,
    sharedSecret: _sharedSecret,
    minExchangeRatePrecision: minExchangeRatePrecision || 2,
    slippage: slippage || 0.07
  })

  return new WebIlpConnection({ connection })
}
