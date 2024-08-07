import type {Buffer} from 'node:buffer';
import type {ClientRequestArgs} from 'node:http';
import {debug, diary, enable} from 'diary';
import WebSocket from 'ws';

enable('*');

function noop() {
  // Noop
  debug('noop');
}

export type SocketteOptions = {
  protocols?: string | string[];
  clientOptions?: WebSocket.ClientOptions | ClientRequestArgs;
  timeout?: number;
  maxAttempts?: number;
  onopen?: (event: WebSocket.Event) => any;
  onmessage?: (event: WebSocket.MessageEvent) => any;
  onreconnect?: (event: WebSocket.ErrorEvent | WebSocket.CloseEvent) => any;
  onmaximum?: (event: WebSocket.ErrorEvent | WebSocket.CloseEvent) => any;
  onclose?: (event: WebSocket.CloseEvent) => any;
  onerror?: (event: WebSocket.ErrorEvent) => any;
};

export type WsSockette = {
  open: () => void;
  reconnect: (event: WebSocket.ErrorEvent | WebSocket.CloseEvent) => void;
  json: (data: any) => void;
  send: (data: any) => void;
  close: (code: number, data?: string | Buffer | undefined) => void;
  getWsInstance: () => WebSocket;
};

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

  const logger = diary('sockette');

  $.open = () => {
    logger.info('Opening websocket', url);
    ws = new WebSocket(url, protocols, clientOptions);

    ws.addEventListener('message', (event) => {
      logger.info('Received:', event);
      onmessage(event);
    });

    ws.addEventListener('open', (event) => {
      logger.info('Connected!', event);
      onopen(event);
      counter = 0;
    });

    ws.addEventListener('close', (event) => {
      logger.info('Closed!', event);
      if (!(event.code === 1e3 || event.code === 1001 || event.code === 1005)) {
        $.reconnect(event);
      }

      onclose(event);
    });

    ws.addEventListener('error', (event) => {
      logger.info('Error:', event);
      if (event?.type === 'ECONNREFUSED') {
        $.reconnect(event);
      } else {
        onerror(event);
      }
    });
  };

  $.reconnect = (event: WebSocket.ErrorEvent | WebSocket.CloseEvent) => {
    logger.info('Reconnecting...', event);
    if (timer && counter++ < maxAttempts) {
      timer = setTimeout(() => {
        onreconnect(event);
        $.open();
      }, timeout) as unknown as number;
    } else {
      onmaximum(event);
    }
  };

  $.json = (data: unknown) => {
    logger.info('Sending json:', data);
    ws.send(JSON.stringify(data));
  };

  $.send = (data: unknown) => {
    logger.info('Sending:', data);
    ws.send(data as ArrayBufferLike);
  };

  $.close = (code = 1e3, data?: string | Buffer | undefined) => {
    logger.info('Closing websocket', code, data);
    timer = clearTimeout(timer) as unknown as number;
    ws.close(code, data);
  };

  $.open(); // Init

  return $;
}
