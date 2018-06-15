function registerWebMonetizationHandler (handlerUri) {
  const dest = encodeURIComponent(window.location.href)
  const handler = encodeURIComponent(handlerUri)
  window.location = 'http://local.sharafian.com/register' +
    '?dest=' + dest +
    '&handler=' + handler
}

function createIlpConnection () {
  console.log('todo')
}
