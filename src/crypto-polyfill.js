
const webCrypto = crypto
const HASH_ALGORIGHM = 'SHA-256'
const ENCRYPTION_ALGORITHM = 'AES-GCM'
const ENCRYPTION_KEY_STRING = Buffer.from('ilp_stream_encryption', 'utf8')
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const BIT_AUTH_TAG_LENGTH = 8*AUTH_TAG_LENGTH
const ENCRYPTION_OVERHEAD = 28
const FULFILLMENT_GENERATION_STRING = Buffer.from('ilp_stream_fulfillment', 'utf8')

const TOKEN_LENGTH = 18
const SHARED_SECRET_GENERATION_STRING = Buffer.from('ilp_stream_shared_secret', 'utf8')

function generateToken () {
  console.log('generateToken')
  return generateRandomCondition(TOKEN_LENGTH)
}

// Not used for Web Javascript
async function generateTokenAndSharedSecret (seed) { 
  console.log('generateTokenAndSharedSecret')
  const token = generateRandomCondition(TOKEN_LENGTH)
  const sharedSecret = await generateSharedSecretFromTokenAsync(seed, token)
  return { token, sharedSecret }
}

// Sync no-op for Web Javascript
async function generateSharedSecretFromToken (seed, token) {
  console.log('generateSharedSecretFromToken SHOULD NEVER BE CALLED!!!!')
  return 'no-op for javascript'
}

async function generateSharedSecretFromTokenAsync (seed, token) {
  console.log('generateSharedSecretFromTokenAsync')
  console.log(SHARED_SECRET_GENERATION_STRING)
  const keygen = await hmac(Buffer.from(seed), SHARED_SECRET_GENERATION_STRING)
  console.log('keygen', keygen)
  console.log('token', token)
  const sharedSecret = await hmac(keygen, Buffer.from(token))
  console.log('sharedSecret', sharedSecret)
  // return sharedSecret
  return Buffer.from(sharedSecret)
}

function generateRandomCondition (size = 32) {
  console.log('generateRandomCondition')
  const randArray = new Uint8Array(size)
  const randValues = webCrypto.getRandomValues(randArray)
  return Buffer.from(randValues)
  // return Buffer.from(randValues.buffer) //TODO: Not sure if this might be the right way
}

async function generatePskEncryptionKey (sharedSecret) {
  console.log('generatePskEncryptionKey')
  return await hmac(sharedSecret, ENCRYPTION_KEY_STRING)
}

async function generateFulfillmentKey (sharedSecret) { 
  console.log('generateFulfillmentKey')
  return await hmac(sharedSecret, FULFILLMENT_GENERATION_STRING)
}

async function generateFulfillment (fulfillmentKey, data) {
  console.log('generateFulfillment')
  return await hmac(fulfillmentKey, data)
}

async function hash (preimage) { //ASSUMING ASYNC
  console.log('hash')
  const digest = await webCrypto.subtle.digest(
    {
        name: HASH_ALGORIGHM,
    },
    getArrayBufferFromBuffer(preimage)
  )
  console.log(digest)
  return digest 
}

async function encrypt (pskEncryptionKey, ...buffers) { //ASSUMING ASYNC
  console.log('encrypt')

  const dataBuffer = Buffer.concat(buffers)
  const iv = webCrypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const alg = { name: ENCRYPTION_ALGORITHM, iv: iv, tagLength: BIT_AUTH_TAG_LENGTH } 
  const key = await webCrypto.subtle.importKey(
    'raw', 
    pskEncryptionKey, 
    alg, 
    false, 
    ["encrypt", "decrypt"]
  )

  const ctBuffer = await webCrypto.subtle.encrypt(
    alg,
    key,
    getArrayBufferFromBuffer(dataBuffer)
  )
  console.log('ctBuffer', ctBuffer.byteLength)
  const tag = ctBuffer.slice(ctBuffer.byteLength - ((AUTH_TAG_LENGTH + 7) >> 3))
  console.log('tag', tag)
  // const encryptKey = await webCrypto.subtle.importKey(
  //   "raw",
  //   pskEncryptionKey,
  //   {
  //     name: ENCRYPTION_ALGORITHM
  //   },
  //   false,
  //   ["encrypt", "decrypt"]
  // )

  // const cipherText = await webCrypto.subtle.encrypt(
  //   {
  //     name: ENCRYPTION_ALGORITHM,
  //     iv: webCrypto.getRandomValues(new Uint8Array(IV_LENGTH)),
  //     tagLength: BIT_AUTH_TAG_LENGTH
  //   },
  //   encryptKey, 
  //   dataBuffer
  // )
  console.log(cipherText)
  console.log('end encrypt')
  return cipherText
}

async function decrypt (pskEncryptionKey, data) { //ASSUMING ASYNC
  console.log('decrypt')

  const nonce = data.slice(0, IV_LENGTH)
  const tag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = data.slice(IV_LENGTH + AUTH_TAG_LENGTH)
  console.log(nonce)
  console.log('tag', tag)
  console.log('encrypted', encrypted)
  
  webCrypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: ArrayBuffer(12), //The initialization vector you used to encrypt
      tagLength: BIT_AUTH_TAG_LENGTH
    },
    key, //from generateKey or importKey above
    data //ArrayBuffer of the data
  )
  return 'todo'
}

async function hmac (key, message) {
  console.log('hmac')
  const hmacKey = await webCrypto.subtle.importKey(
    "raw", 
    key, //TODO: Do we need to get the array buffer here? The key should already be an ArrayBuffer I think...  
    {   
      name: "HMAC",
      hash: {name: HASH_ALGORIGHM}
    },
    false,
    ["sign", "verify"] 
  )
  console.log('hmacKey ', hmacKey)
  
  const signature = await webCrypto.subtle.sign(
    {
        name: "HMAC",
    },
    hmacKey,
    getArrayBufferFromBuffer(message) 
  )
  console.log('signature', signature)
  return signature
}

function getArrayBufferFromBuffer (nodeBuffer) {
  return nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset, nodeBuffer.byteOffset + nodeBuffer.byteLength
  )
  // const webArray = Array.from(nodeBuffer)
  // return new Uint8Array(webArray)
}

//  return Promise.resolve({ token, sharedSecret })

// module.exports = {
//   ENCRYPTION_OVERHEAD,
//   generateToken,
//   generateTokenAndSharedSecret,
//   generateSharedSecretFromTokenAsync,
//   generateRandomCondition,
//   generatePskEncryptionKey,
//   generateFulfillmentKey,
//   generateFulfillment,
//   hash,
//   encrypt,
//   decrypt,
// }
