const IlpStream = require('ilp-protocol-stream')
const WebIlpConnection = require('./web-connection')
const Plugin = require('./plugin')

window.monetize = window.monetize || {}
window.monetize._createConnection = async function ({
  handlerFrame,
  destinationAccount,
  sharedSecret
}) {
  // is there a way to do this w/out buffer/crypto
  const _sharedSecret = Buffer.from(sharedSecret, 'base64')
  const plugin = new Plugin({ handlerFrame })
  const connection = await IlpStream.createConnection({
    plugin,
    destinationAccount,
    sharedSecret: _sharedSecret
  })

  return new WebIlpConnection({ connection })
}
