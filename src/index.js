function registerWebMonetizationHandler (handlerUri, destUri) {
  const dest = encodeURIComponent(destUri || window.location.href)
  const handler = encodeURIComponent(handlerUri)
  window.location = 'http://webmonetization.sharafian.com:8080/register' +
    '?dest=' + dest +
    '&handler=' + handler
}

function createIlpConnection () {
  // TODO: inject the stream library
  // TODO: inject the iframe
  // TODO: create the iframe plugin
  // TODO: instantiate the stream and return it
}
