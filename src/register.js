window.onload = function () {
  const div = document.getElementById('confirm-div')
  const span = document.getElementById('handler')
  const name = document.getElementById('handler-name')
  const confirm = document.getElementById('confirm')
  const cancel = document.getElementById('cancel')
  const params = new URLSearchParams(window.location.search)
  const handler = params.get('handler')
  const handlerName = params.get('name')

  confirm.onclick = function (e) {
    e.preventDefault()

    window.localStorage.setItem('handler', handler)
    window.parent.postMessage({ notification: 'confirm' }, '*')
  }

  cancel.onclick = function (e) {
    e.preventDefault()

    window.parent.postMessage({ notification: 'cancel' }, '*')
  }

  span.innerText = new URL(handler).host
  name.innerText = handlerName
  div.style = '' 
}
