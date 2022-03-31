# Welcome to ws-sockette 👋

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Twitter: jellydn](https://img.shields.io/twitter/follow/jellydn.svg?style=social)](https://twitter.com/jellydn)

> The little WebSocket wrapper for nodejs

## Install

```sh
yarn install ws-sockette
```

## Why

[Sockette](https://github.com/lukeed/sockette) is a tiny (367 bytes) wrapper around WebSocket that will automatically reconnect if the connection is lost!

However, sockette doesn't work for nodejs and missing support for [client options](https://github.com/lukeed/sockette/blob/master/src/index.js#L10) for create a websocket client

```typescript
new WebSocket(
        address: string | URL,
        protocols?: string | string[],
        options?: WebSocket.ClientOptions | ClientRequestArgs,
    );
```

That's why I take a chance to rewrite with typescript and support nodejs. If you need a tiny wrapper for browser, please use sockette.

## Usage

```typescript
const WsSockette = require("ws-sockette");

const ws = new WsSockette("ws://localhost:3000", {
  clientOptions: {
    headers: {
      Authorization: "Basic YWxhZGRpbjpvcGVuc2VzYW1l",
    },
  },
  timeout: 5e3,
  maxAttempts: 10,
  onopen: (e) => console.log("Connected!", e),
  onmessage: (e) => console.log("Received:", e),
  onreconnect: (e) => console.log("Reconnecting...", e),
  onmaximum: (e) => console.log("Stop Attempting!", e),
  onclose: (e) => console.log("Closed!", e),
  onerror: (e) => console.log("Error:", e),
});

ws.send("Hello, world!");
ws.json({ type: "ping" });
ws.close(); // graceful shutdown

// Reconnect 10s later
setTimeout(ws.reconnect, 10e3);
```

## API

```typescript
interface SocketteOptions {
  // This is a new option if you compare with sockette
  clientOptions?: WebSocket.ClientOptions | ClientRequestArgs;

  protocols?: string | string[];
  timeout?: number;
  maxAttempts?: number;
  onopen?: (ev: WebSocket.Event) => any;
  onmessage?: (ev: WebSocket.MessageEvent) => any;
  onreconnect?: (ev: WebSocket.ErrorEvent | WebSocket.CloseEvent) => any;
  onmaximum?: (ev: WebSocket.ErrorEvent | WebSocket.CloseEvent) => any;
  onclose?: (ev: WebSocket.CloseEvent) => any;
  onerror?: (ev: WebSocket.ErrorEvent) => any;
}
```

Please check it [here for complete document](https://github.com/lukeed/sockette/blob/master/readme.md#api)

## Run tests

```sh
yarn test
```

## Author

👤 **Huynh Duc Dung**

- Website: https://productsway.com/
- Twitter: [@jellydn](https://twitter.com/jellydn)
- Github: [@jellydn](https://github.com/jellydn)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
