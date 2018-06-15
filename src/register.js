window.onload = function () {
  const div = document.getElementById('confirm-div')
  const span = document.getElementById('handler')
  const confirm = document.getElementById('confirm')
  const params = new URLSearchParams(window.location.search)
  const handler = params.get('handler')

  confirm.onclick = function (e) {
    e.preventDefault()

    window.localStorage.setItem('handler', handler)
    window.location = params.get('dest')
  }

  span.innerText = handler
  div.style = '' 
}
