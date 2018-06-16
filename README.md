# Web Monetization Polyfill
> Use web monetization without a browser extension

- [Test an Example Page](#test-an-example-page)
- [How it Works](#how-it-works)
  - [Register Web Monetization Handler](#register-web-monetization-handler)
  - [Monetize a Web Page](#monetize-a-web-page)
- [TODOs](#todos)

## Test an Example Page

```
npm install
node index.js &
http-server -p 8090 example
open http://localhost:8090
```

## How it Works

### Register Web Monetization Handler

- A page pulls in the polyfill script.
- The page calls `registerWebMonetizationPolyfill` with the url of their web monetization handler.
- The user is redirected to the web monetization polyfill site and asked to confirm.
- The user confirms and is redirected back.

### Monetize a Web Page

- A page pulls in the polyfill script.
- The page calls `createIlpConnection` with the ILP address and shared secret to use.
- The polyfill pulls in the STREAM library.
- The polyfill creates an iframe pointing to the url of the web monetization handler.
- The polyfill creates an `IlpPluginIframe` pointing to the Iframe
- The polyfill instantiates an IlpStream connection with the address, shared secret, and plugin
- Ilp packets are passed via `IlpPluginIframe` to the handler iframe

## TODOs

- [ ] the user can reject the request and return to a different URL.
- [ ] finish writing the iframe plugin.
- [ ] write an ILP handler for the example that can connect to moneyd.
- [ ] make the index compile to something even smaller
- [ ] make sure that all features from second have been ported over
- [ ] check if web monetization already exists in the browser
