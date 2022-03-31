import {Buffer} from 'node:buffer';
import {ClientRequestArgs} from 'node:http';
import WebSocket from 'ws';

function noop() {
  // Noop
}

export interface SocketteOptions {
  protocols?: string | string[];
  clientOptions?: WebSocket.ClientOptions | ClientRequestArgs;
  timeout?: number;
  maxAttempts?: number;
  onopen?: (ev: WebSocket.Event) => any;
  onmessage?: (ev: WebSocket.MessageEvent) => any;
  onreconnect?: (ev: WebSocket.ErrorEvent | WebSocket.CloseEvent) => any;
  onmaximum?: (ev: WebSocket.ErrorEvent | WebSocket.CloseEvent) => any;
  onclose?: (ev: WebSocket.CloseEvent) => any;
  onerror?: (ev: WebSocket.ErrorEvent) => any;
}

export default function wsSockette(
  url: string | URL,
  options: SocketteOptions,
) {
  let ws: WebSocket;
  let counter = 0;
  let timer: NodeJS.Timeout;
  const $: {
    open: () => void;
    reconnect: (event: WebSocket.ErrorEvent | WebSocket.CloseEvent) => void;
    json: (data: any) => void;
    send: (data: any) => void;
    close: (code: number, data?: string | Buffer | undefined) => void;
  } = {
    open: noop,
    reconnect: noop,
    json: noop,
    send: noop,
    close: noop,
  };
  const {
    protocols = [],
    onclose = noop,
    onopen = noop,
    onmessage = noop,
    onreconnect = noop,
    onmaximum = noop,
    onerror = noop,
    clientOptions,
    maxAttempts = Number.POSITIVE_INFINITY,
    timeout = 1e3,
  } = options || {};

  $.open = function () {
    ws = new WebSocket(url, protocols, clientOptions);

    ws.addEventListener('message', (event) => {
      onmessage(event);
    });

    ws.addEventListener('open', (event) => {
      onopen(event);
      counter = 0;
    });

    ws.addEventListener('close', (event) => {
      if (!(event.code === 1e3 || event.code === 1001 || event.code === 1005)) {
        $.reconnect(event);
      }

      onclose(event);
    });

    ws.addEventListener('error', (event) => {
      if (event?.type === 'ECONNREFUSED') {
        $.reconnect(event);
      } else {
        onerror(event);
      }
    });
  };

  $.reconnect = (event: WebSocket.ErrorEvent | WebSocket.CloseEvent) => {
    if (timer && counter++ < maxAttempts) {
      timer = setTimeout(() => {
        onreconnect(event);
        $.open();
      }, timeout);
    } else {
      onmaximum(event);
    }
  };

  $.json = function (data: any) {
    ws.send(JSON.stringify(data));
  };

  $.send = function (data: any) {
    ws.send(data);
  };

  $.close = function (code = 1e3, data?: string | Buffer | undefined) {
    clearTimeout(timer);
    ws.close(code, data);
  };

  $.open(); // Init

  return $;
}
