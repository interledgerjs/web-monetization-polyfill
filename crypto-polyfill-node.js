
const webCrypto = crypto

function randomBytes (size) {
  const randArray = new Uint8Array(size)
  return webCrypto.getRandomValues(randArray)
}

function createHmac(algorithm, secret) { //TODO: is it value or message, or....
  const secretBuffer = Array.from(secret)
  const arrayBufSecret = new Uint8Array(secretBuffer)
  console.log(typeof arrayBufSecret)
  const key = crypto.subtle.importKey(
    "raw", 
    arrayBufSecret,
    {   
      name: "HMAC",
      hash: {name: "SHA-256"}
    },
    false,
    ["sign", "verify"] 
  )
  console.log('createHmac ', key)

  const update = () => {
    console.log('createHmac update')
  }

  const digest = () => {
    console.log('createHmac digest')
  }
  
  return {
    update,
    digest
  }
}

function createDecipheriv (algorithm, key, nonce) {
  console.log('createDecipheriv')
  return 'ddddd'
}

function createCipheriv (algorithm, key, nonce) { //TODO: is it nonce or iv
  console.log('createCipheriv')
  const update = () => {
    console.log('createCipheriv update')
  }

  const final = () => {
    console.log('createCipheriv final')
  }

  const getAuthTag = () => {
    console.log('createCipheriv getAuthTag')
  }

  return {
    update,
    final,
    getAuthTag
  }
}

function createHash (algorithm) {
  console.log('createHash')
  return 'hash'
}

module.exports = {
  randomBytes,
  createHmac,
  createDecipheriv,
  createCipheriv,
  createHash
}
