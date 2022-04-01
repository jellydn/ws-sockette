import {debug} from 'debug';
import {Buffer} from 'node:buffer';
import {ClientRequestArgs} from 'node:http';
import WebSocket from 'ws';

function noop() {
  debug('noop');
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

export interface WsSockette {
  open: () => void;
  reconnect: (event: WebSocket.ErrorEvent | WebSocket.CloseEvent) => void;
  json: (data: any) => void;
  send: (data: any) => void;
  close: (code: number, data?: string | Buffer | undefined) => void;
  getWsInstance: () => WebSocket;
}

export function wsSockette(
  url: string | URL,
  options: SocketteOptions,
): WsSockette {
  let ws: WebSocket;
  let counter = 0;
  let timer = 1;

  const $: WsSockette = {
    open: noop,
    reconnect: noop,
    json: noop,
    send: noop,
    close: noop,
    getWsInstance: () => ws,
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

  const logger = debug('ws-sockette');

  $.open = function () {
    logger('Opening websocket', url);
    ws = new WebSocket(url, protocols, clientOptions);

    ws.addEventListener('message', (event) => {
      logger('Received:', event);
      onmessage(event);
    });

    ws.addEventListener('open', (event) => {
      logger('Connected!', event);
      onopen(event);
      counter = 0;
    });

    ws.addEventListener('close', (event) => {
      logger('Closed!', event);
      if (!(event.code === 1e3 || event.code === 1001 || event.code === 1005)) {
        $.reconnect(event);
      }

      onclose(event);
    });

    ws.addEventListener('error', (event) => {
      logger('Error:', event);
      if (event?.type === 'ECONNREFUSED') {
        $.reconnect(event);
      } else {
        onerror(event);
      }
    });
  };

  $.reconnect = (event: WebSocket.ErrorEvent | WebSocket.CloseEvent) => {
    logger('Reconnecting...', event);
    if (timer && counter++ < maxAttempts) {
      timer = setTimeout(() => {
        onreconnect(event);
        $.open();
      }, timeout) as unknown as number;
    } else {
      onmaximum(event);
    }
  };

  $.json = function (data: unknown) {
    logger('Sending json:', data);
    ws.send(JSON.stringify(data));
  };

  $.send = function (data: unknown) {
    logger('Sending:', data);
    ws.send(data);
  };

  $.close = function (code = 1e3, data?: string | Buffer | undefined) {
    logger('Closing websocket', code, data);
    timer = clearTimeout(timer) as unknown as number;
    ws.close(code, data);
  };

  $.open(); // Init

  return $;
}
