import { wsSockette } from "../dist";

const ws = wsSockette("ws://echo.websocket.org/.ws", {
  timeout: 5e3,
  maxAttempts: 10,
  onopen() {
    console.log("Connected!");
  },
  onmessage(event) {
    console.log("Received:", event);
  },
  onreconnect(event) {
    console.log("Reconnecting...");
  },
  onmaximum(event) {
    console.log("Stop Attempting!");
  },
  onclose(event) {
    console.log("Closed!", event);
  },
  onerror(event) {
    console.log("Error:", event);
  },
});

// Reconnect 3s later
setTimeout(ws.reconnect, 3e3);

// Close the connection after 5s
setTimeout(() => {
  ws.send("Hello, world!");
  ws.json({ type: "ping" });
  ws.close(1000); // Graceful shutdown
}, 5e3);
