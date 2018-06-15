window.onload = function () {
  const div = document.getElementById('confirm-div')
  const span = document.getElementById('handler')
  const confirm = document.getElementById('confirm')
  const params = new URLSearchParams(window.location.search)
  const existing = window.localStorage.getItem('handler')
  const existingText = document.getElementById('existing')
  const handler = params.get('handler')

  if (existing) {
    existingText.innerText = 'existing handler is ' + existing
  }

  confirm.onclick = function (e) {
    e.preventDefault()

    window.localStorage.setItem('handler', handler)
    window.location = params.get('dest')
  }

  span.innerText = handler
  div.style = '' 
}
