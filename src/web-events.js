function IlpDataEvent (data) {
  const e = new Event('data')
  e.data = data
  return e
}

function IlpMoneyEvent (amount) {
  const e = new Event('money')
  e.amount = amount
  return e
}

function IlpOutgoingMoneyEvent (amount) {
  const e = new Event('outgoing_money')
  e.amount = amount
  return e
}

function IlpCloseEvent () {
  const e = new Event('close')
  return e
}

function IlpErrorEvent (err) {
  const e = new Event('error')
  e.error = err
  return e
}

function IlpStreamEvent (stream) {
  const e = new Event('stream')
  e.stream = stream
  return e
}

module.exports = {
  IlpDataEvent,
  IlpMoneyEvent,
  IlpOutgoingMoneyEvent,
  IlpCloseEvent,
  IlpErrorEvent
}
