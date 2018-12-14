const assert = require('chai').assert
const puppeteer = require('puppeteer')
const streamCrypto = require('ilp-protocol-stream/src/crypto')
const serve = require('koa-static')
const Koa = require('koa')
const getPort = require('get-port')
const path = require('path')

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2) // 2 bytes for each char
  var bufView = new Uint16Array(buf)
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i)
  }
  return buf
}

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
    // const testData = new Buffer.from('Hello this is my super secret message')
    const token = Buffer.from('connectionid', 'ascii')
    const secret = streamCrypto.generateRandomCondition()

    console.log('token', token)
    console.log('secret', secret)
    // const nodeToken = streamCrypto.generateToken()
    const nodeSecret = streamCrypto.generateRandomCondition()
    const nodeSharedSecret = streamCrypto.generateSharedSecretFromToken(secret, token) //TODO: Make this use the stream async lib 
    const webSharedSecret = await page.evaluate(async (secret, token) => {
      console.log('secret', secret)
      console.log('token', token)
      // const token = generateToken()
      // const secret = generateRandomCondition()
      const sharedSecret = await generateSharedSecretFromTokenAsync(secret, token)
      return sharedSecret
    }, secret, token)
    
    console.log('nodeSharedSecret', nodeSharedSecret)
    console.log('webSharedSecret', webSharedSecret)
    const webSharedSecretArray = bufToArray(webSharedSecret)
    const nodeSharedSecretArray = bufToArray(nodeSharedSecret)
    console.log('nodeSharedSecretArray', nodeSharedSecretArray)
    console.log('nodeSharedSecret length', nodeSharedSecret.length)
    console.log('webSharedSecretArray', webSharedSecretArray)
    console.log('wss', webSharedSecretArray.length)
    assert.deepEqual(nodeSharedSecretArray, webSharedSecretArray)
    // const myArrBuff = new ArrayBuffer(18)
    // console.log(myArrBuff)
    // const nodeBuffer = Buffer.from(myArrBuff)
    // console.log(nodeBuffer)

    // console.log(Buffer.isBuffer(nodeToken))
    // console.log(nodeToken.length)
    // console.log(Buffer.isBuffer(webToken))
    // console.log(webToken.length)
    // console.log(Array.from(webToken))
    // let webTokenArray = []
    // let i = 0
    // while (true) {
    //   if (webToken[i] === undefined) {
    //     break
    //   }
    //   webTokenArray[i] = webToken[i]
    //   i++
    // }
    // assert.equal(nodeToken.length, webTokenArray.length)
  })

})
