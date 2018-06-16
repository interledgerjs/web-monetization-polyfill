const IlpStream = require('ilp-protocol-stream')
const Plugin = require('./plugin')

window.monetize = window.monetize || {}
window.monetize._createConnection = async function ({
  iframe,
  destinationAccount,
  sharedSecret
}) {
  // is there a way to do this w/out buffer/crypto
  const _sharedSecret = Buffer.from(sharedSecret, 'base64')

  const plugin = new Plugin({ iframe })
  return IlpStream.createConnection({
    plugin,
    destinationAccount,
    sharedSecret: _sharedSecret
  })
}
