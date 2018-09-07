function matchesHandlerOrigin (inquiringOrigin) {
  const handler = window.localStorage.getItem('handler')
  if (!handler) {
    return false
  }
  return new URL(handler).origin === inquiringOrigin
}

window.addEventListener('message', event => {
  const inquiringOrigin = event.origin

  window.parent.postMessage({
    id: event.data.id,
    response: {
      registered: matchesHandlerOrigin(inquiringOrigin)
    }
  }, inquiringOrigin)
})
