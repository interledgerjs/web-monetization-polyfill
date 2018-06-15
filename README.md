# Web Monetization Polyfill
> Use web monetization without a browser extension

## How it Works

### Register Web Monetization Handler

- A page pulls in the polyfill script.
- The page calls `registerWebMonetizationPolyfill` with the url of their web monetization handler.
- The user is redirected to the web monetization polyfill site and asked to confirm.
- The user confirms and is redirected back.
- [ ] TODO: the user can reject the request and return to a different URL.

### Monetize a Web Page

- A page pulls in the polyfill script.
- The page calls `createIlpConnection` with the ILP address and shared secret to use.
- The polyfill pulls in the STREAM library.
- The polyfill creates an iframe pointing to the url of the web monetization handler.
- The polyfill creates an `IlpPluginIframe` pointing to the Iframe
- The polyfill instantiates an IlpStream connection with the address, shared secret, and plugin
- Ilp packets are passed via `IlpPluginIframe` to the handler iframe
