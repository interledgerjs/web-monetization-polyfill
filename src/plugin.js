class Plugin {
  async connect () {
  }

  async disconnect () {
  }

  async isConnected () {
    return true
  }

  registerDataHandler () {
  }

  async sendData (data) {
    console.log('sending data but hanging instead...')
    console.log('data: ' + data.toString('hex'))
    return new Promise(() => {})
  }
}

module.exports = Plugin
