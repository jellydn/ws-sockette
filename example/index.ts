import { wsSockette } from "../dist";

const ws = wsSockette("ws://echo.websocket.org/.ws", {
  timeout: 5e3,
  maxAttempts: 10,
  onopen() {
    console.log("Connected!");
    ws.send("Hello, world!");
    ws.json({ type: "ping" });
  },
  onmessage(event) {
    console.log("Received:", event.data);
  },
  onreconnect(event) {
    console.log("Reconnecting...", event.target);
  },
  onmaximum(event) {
    console.log("Stop Attempting!", event.target);
  },
  onclose(event) {
    console.log("Closed!", event);
  },
  onerror(event) {
    console.log("Error:", event.error);
  },
});

setTimeout(() => {
  ws.close(1000); // Graceful shutdown
}, 5e3);

// Reconnect 3s later
setTimeout(ws.reconnect, 3e3);
