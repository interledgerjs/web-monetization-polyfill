const assert = require('chai').assert
const puppeteer = require('puppeteer')
const streamCrypto = require('ilp-protocol-stream/src/crypto')
const streamPacket = require('ilp-protocol-stream/src/packet')
const serve = require('koa-static')
const Koa = require('koa')
const getPort = require('get-port')
const path = require('path')

function bufToArray (buffer) {
  let convertedArray = []
  let i = 0
  while (true) {
    if (buffer[i] === undefined) {
      break
    }
    convertedArray[i] = buffer[i]
    i++
  }
  return convertedArray
}

describe('stream crypto lib test', async function() {
  let port
  let browser
  let page

  before(async function() {
    const app = new Koa()
    app.use(serve(path.join(__dirname, '../')))
    port = await getPort()
    app.listen(port) 
    console.log(`Server Listening at http://localhost:${port}`)
    browser = await puppeteer.launch({
      headless: false,
    })
    page = await browser.newPage()
    await page.goto(`http://localhost:${port}/test/static/index.html`)
  })



  it('generateRandomCondition', async function() {
    const nodeSecret = streamCrypto.generateRandomCondition() 
    const webSecret = await page.evaluate(() => generateRandomCondition())
    const webSecretArray = bufToArray(webSecret)
    assert.equal(nodeSecret.length, webSecretArray.length)
  })

  it('generateToken', async function() {
    const nodeToken = streamCrypto.generateToken() 
    const webToken = await page.evaluate(() => generateToken())
    const webTokenArray = bufToArray(webToken)
    assert.equal(nodeToken.length, webTokenArray.length)
  })
  
  it('generateSharedSecretFromTokenAsync', async function() {
    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()

    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    
    const webSharedSecret = await page.evaluate(async (secret, token) => {
      return await generateSharedSecretFromTokenAsync(secret, token)
    }, secret, token)
    
    const webSharedSecretArray = bufToArray(webSharedSecret)
    const nodeSharedSecretArray = bufToArray(nodeSharedSecret)
    assert.deepEqual(nodeSharedSecretArray, webSharedSecretArray)
  })

  it('generatePskEncryptionKey', async function() {
    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()

    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    const nodePskKey = streamCrypto.generatePskEncryptionKey(nodeSharedSecret)
    
    const webPskKey = await page.evaluate(async (secret, token) => {
      const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
      return await generatePskEncryptionKey(webSharedSecret)
    }, secret, token)
    
    const nodePskKeyArray = bufToArray(nodePskKey)
    const webPskKeyArray = bufToArray(webPskKey)
    assert.deepEqual(nodePskKeyArray, webPskKeyArray) 



  })

  it('generateFulfillmentKey', async function() {
    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()

    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    
    const nodeFulfillmentKey = streamCrypto.generateFulfillmentKey(nodeSharedSecret)
    
    const webFulfillmentKey = await page.evaluate(async (secret, token) => {
      const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
      return await generateFulfillmentKey(webSharedSecret)
    }, secret, token)
    
    const nodeFulfillmentKeyArray = bufToArray(nodeFulfillmentKey)
    const webFulfillmentKeyArray = bufToArray(webFulfillmentKey)
    assert.deepEqual(nodeFulfillmentKeyArray, webFulfillmentKeyArray) 
  })

  it('generateFulfillment', async function() {
    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()
    const data = Buffer.from('This is super secret data')

    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    const nodeFulfillmentKey = streamCrypto.generateFulfillmentKey(nodeSharedSecret)
    const nodeFulfillment = streamCrypto.generateFulfillment(nodeFulfillmentKey, data)
    
    const webFulfillment = await page.evaluate(async (secret, token, data) => {
      const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
      const fulfillmentKey = await generateFulfillmentKey(webSharedSecret)
      return await generateFulfillment(fulfillmentKey, data)
    }, secret, token, data)
    
    const nodeFulfillmentArray = bufToArray(nodeFulfillment)
    const webFulfillmentArray = bufToArray(webFulfillment)
    assert.deepEqual(nodeFulfillmentArray, webFulfillmentArray) 
  })

  it('hash', async function() {
    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()
    const data = Buffer.from('This is super secret data')

    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    const nodeFulfillmentKey = streamCrypto.generateFulfillmentKey(nodeSharedSecret)
    const nodeFulfillment = streamCrypto.generateFulfillment(nodeFulfillmentKey, data)
    const nodeHash = streamCrypto.hash(nodeFulfillment)

    const webHash = await page.evaluate(async (secret, token, data) => {
      const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
      const fulfillmentKey = await generateFulfillmentKey(webSharedSecret)
      const fulfillment = await generateFulfillment(fulfillmentKey, data)
      return await hash(fulfillment)
    }, secret, token, data)
   
    console.log('nodeHash', nodeHash)
    console.log('webHash', webHash)

    const nodeHashArray = bufToArray(nodeHash)
    const webHashArray = bufToArray(webHash)
    console.log('nodeKeyArray', nodeHashArray)
    console.log('webKeyArray', webHashArray)
    assert.deepEqual(nodeHashArray, webHashArray) 
  })

  it('encrypt - decrypt nodejs', async function() {
    const moneyPacket = new streamPacket.Packet(22, 14, 5, [
      new streamPacket.StreamMoneyFrame(1, 1),
      new streamPacket.StreamMoneyFrame(2, 2)
    ])
    const serializedPacket = moneyPacket._serialize()
    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()

    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    const nodePskKey = streamCrypto.generatePskEncryptionKey(nodeSharedSecret)

    const nodeEncryptedData = await streamCrypto.encrypt(nodePskKey, serializedPacket)
    const nodeDecryptedData = await streamCrypto.decrypt(nodePskKey, nodeEncryptedData)
    
    const decryptedPacket = streamPacket.Packet._deserializeUnencrypted(nodeDecryptedData) 
    assert.deepEqual(moneyPacket, decryptedPacket)
  })

  it.only('encrypt - decrypt web-crypto', async function() {
    const moneyPacket = new streamPacket.Packet(22, 14, 5, [
      new streamPacket.StreamMoneyFrame(1, 1),
      new streamPacket.StreamMoneyFrame(2, 2)
    ])

    console.log('moneyPacket', moneyPacket.sequence.toString())
    const serializedPacket = moneyPacket._serialize()
    console.log('serializedPacket', serializedPacket.buffer)

    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()
    console.log('buffers', serializedPacket) 
    const arrBuffers = Array.from(serializedPacket) 
    const webDecryptedData = await page.evaluate(async (secret, token, buffers) => {
      console.log('buffers', buffers)
      // console.log('buffers.buffer', Buffer.from(buffers))
      // const arrBuf = Array.from(buffers)
      // console.log('arrBuf', arrBuf)
      const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
      const pskKey = await generatePskEncryptionKey(webSharedSecret)
      const webEncryptedData = await encrypt(pskKey, buffers)
      return await decrypt(pskKey, webEncryptedData)
    // }, secret, token, serializedPacket)
    }, secret, token, arrBuffers)

    console.log('decryptedData', webDecryptedData)
    const decryptedPacket = streamPacket.Packet._deserializeUnencrypted(webDecryptedData) 

    console.log('deserializedData', decryptedPacket.sequence.toString())
    assert.deepEqual(moneyPacket, decryptedPacket)
  })

  it('encrypt web-crypto - decrypt nodejs', async function() {
    const moneyPacket = new streamPacket.Packet(22, 14, 5, [
      new streamPacket.StreamMoneyFrame(1, 1),
      new streamPacket.StreamMoneyFrame(2, 2)
    ])

    console.log('moneyPacket', moneyPacket.sequence.toString())

    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()

    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    const nodePskKey = streamCrypto.generatePskEncryptionKey(nodeSharedSecret)
    const serializedPacket = moneyPacket._serialize()
    const nodeEncryptedData = await streamCrypto.encrypt(nodePskKey, serializedPacket)

    const nodeDecryptedData = await streamCrypto.decrypt(nodePskKey, nodeEncryptedData)
    const decryptedPacket = streamPacket.Packet._deserializeUnencrypted(nodeDecryptedData) 

    console.log('deserializedData', decryptedPacket.sequence.toString())
    assert.deepEqual(moneyPacket, decryptedPacket)
    // const webEncryptedData = await page.evaluate(async (secret, token, buffers) => {
    //   const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
    //   const pskKey = await generatePskEncryptionKey(webSharedSecret)
    //   return encrypt(pskKey, buffers)
    // }, secret, token, dataBuffers)
    
    // console.log('nodeEncryptedData', nodeEncryptedData)
    // console.log('webEncryptedData', webEncryptedData)



    // const token = Buffer.from('connectionid', 'ascii')
    // const secret = streamCrypto.generateRandomCondition()
    // const data = Buffer.from('This is super secret data')

    // const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    // const nodeFulfillmentKey = streamCrypto.generateFulfillmentKey(nodeSharedSecret)
    // const nodeFulfillment = streamCrypto.generateFulfillment(nodeFulfillmentKey, data)
    // const nodeHash = streamCrypto.hash(nodeFulfillment)

    // const webHash = await page.evaluate(async (secret, token, data) => {
    //   const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
    //   const fulfillmentKey = await generateFulfillmentKey(webSharedSecret)
    //   const fulfillment = await generateFulfillment(fulfillmentKey, data)
    //   return await hash(fulfillment)
    // }, secret, token, data)
   
    // console.log('nodeHash', nodeHash)
    // console.log('webHash', webHash)

    // const nodeHashArray = bufToArray(nodeHash)
    // const webHashArray = bufToArray(webHash)
    // console.log('nodeKeyArray', nodeHashArray)
    // console.log('webKeyArray', webHashArray)
    // assert.deepEqual(nodeHashArray, webHashArray) 
  })

  it('encrypt nodejs - decrypt web-crypto', async function() {
  
    const moneyPacket = new streamPacket.Packet(22, 14, 5, [
      new streamPacket.StreamMoneyFrame(1, 1),
      new streamPacket.StreamMoneyFrame(2, 2)
    ])

    console.log('moneyPacket', moneyPacket.sequence.toString())

    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()

    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    const nodePskKey = streamCrypto.generatePskEncryptionKey(nodeSharedSecret)
    const serializedPacket = moneyPacket._serialize()
    const nodeEncryptedData = await streamCrypto.encrypt(nodePskKey, serializedPacket)

    const nodeDecryptedData = await streamCrypto.decrypt(nodePskKey, nodeEncryptedData)
    const decryptedPacket = streamPacket.Packet._deserializeUnencrypted(nodeDecryptedData) 

    console.log('deserializedData', decryptedPacket.sequence.toString())
    assert.deepEqual(moneyPacket, decryptedPacket)
    // const webEncryptedData = await page.evaluate(async (secret, token, buffers) => {
    //   const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
    //   const pskKey = await generatePskEncryptionKey(webSharedSecret)
    //   return encrypt(pskKey, buffers)
    // }, secret, token, dataBuffers)
    
    // console.log('nodeEncryptedData', nodeEncryptedData)
    // console.log('webEncryptedData', webEncryptedData)



    // const token = Buffer.from('connectionid', 'ascii')
    // const secret = streamCrypto.generateRandomCondition()
    // const data = Buffer.from('This is super secret data')

    // const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) 
    // const nodeFulfillmentKey = streamCrypto.generateFulfillmentKey(nodeSharedSecret)
    // const nodeFulfillment = streamCrypto.generateFulfillment(nodeFulfillmentKey, data)
    // const nodeHash = streamCrypto.hash(nodeFulfillment)

    // const webHash = await page.evaluate(async (secret, token, data) => {
    //   const webSharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
    //   const fulfillmentKey = await generateFulfillmentKey(webSharedSecret)
    //   const fulfillment = await generateFulfillment(fulfillmentKey, data)
    //   return await hash(fulfillment)
    // }, secret, token, data)
   
    // console.log('nodeHash', nodeHash)
    // console.log('webHash', webHash)

    // const nodeHashArray = bufToArray(nodeHash)
    // const webHashArray = bufToArray(webHash)
    // console.log('nodeKeyArray', nodeHashArray)
    // console.log('webKeyArray', webHashArray)
    // assert.deepEqual(nodeHashArray, webHashArray) 
  })

  it('decrypt', async function() {
    
  })
})
