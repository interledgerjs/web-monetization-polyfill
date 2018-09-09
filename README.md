# Web Monetization Polyfill
> Use [web monetization](https://github.com/interledger/rfcs/blob/master/0028-web-monetization/0028-web-monetization.md#web-monetization) without a browser extension

- [Usage](#usage)
- [Specification](#specification)
  - [Register Web Monetization Handler](#register-web-monetization-handler)
  - [Monetize a Web Page](#monetize-a-web-page)
- [TODOs](#todos)

## Usage

You can include the polyfill with the following script tag:

```html
<script src="https://polyfill.webmonetization.org/polyfill.js"></script>
```

If you want to use Web Monetization in your webpage, most users will have an easier time using the [pre-written web monetization scripts,](https://github.com/interledgerjs/web-monetization-scripts) intended for common use cases. The Web Monetization API should only be used directly if you need to write advanced functionality or are familiar with the Interledger stack.

## Specification

The exact specification of these methods can be found [in the Web Monetization RFC](https://github.com/interledger/rfcs/blob/master/0028-web-monetization/0028-web-monetization.md#web-monetization). This README just describes how the polyfill implements these functions.

### Register Web Monetization Handler

Associates a 'handlerUri' as this browser's web monetization handler so that they can send and receive Interledger packets on behalf of the user. Unless you're a Web Monetization provider like [Coil](https://coil.com) you don't need to use this function. If you want to implement a handler, the API can be found in [the Web Monetization RFC](https://github.com/interledger/rfcs/blob/master/0028-web-monetization/0028-web-monetization.md#web-monetization).

```js
window.WebMonetization.register({ name: string, handlerUri: string })
```

- A page pulls in the polyfill script.
- The page calls `window.WebMonetization.register` with the url of their web monetization handler.
- A popup is created, asking the user to confirm their web monetization handler
- The user confirms and the popup is dismissed

### Monetize a Web Page

Creates an [Interledger/STREAM connection](https://github.com/interledger/rfcs/blob/master/0028-web-monetization/0028-web-monetization.md#ilp-connection-class) that allows the webpage to send money over Interledger.

```js
async window.WebMonetization.monetize({
  destinationAccount: string,
  sharedSecret: string
})
```

- A page pulls in the polyfill script.
- When `monetize` is called, the polyfill pulls in the STREAM library.
- The polyfill creates an iframe for `polyfill.webmonetization.org`.
- The polyfill's iframe pulls in an iframe to the user's `handlerUri`.
- The polyfill calls `createIlpConnection` with the ILP address and shared secret to use.
- The polyfill creates an `IlpPluginIframe` pointing to the polyfill's iframe
- The polyfill instantiates an IlpStream connection with the address, shared secret, and plugin
- Ilp packets are passed via `IlpPluginIframe` to the polyfill's iframe, then passed to the user's handler handler iframe so they can be sent over the Interledger network.
