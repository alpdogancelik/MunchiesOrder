import { Server as HTTPServer } from "http";
import { WebSocketServer } from "ws";
import type { WebSocket, RawData } from "ws";
import { parse } from "url";

// Simple in-memory hub keyed by orderId
const orderRooms = new Map<number, Set<WebSocket>>();
const courierSockets = new Map<WebSocket, { orderId: number | null }>();

function parseMessage(data: RawData) {
  try {
    return JSON.parse(data.toString());
  } catch {
    return null;
  }
}

export function initWebSocket(server: HTTPServer) {
  // Use noServer + manual upgrade routing to avoid interfering with
  // other WebSocket servers (e.g., Vite HMR on "/"). If we attach
  // directly with { server, path }, ws will register a generic
  // 'upgrade' handler and abort non-matching paths with HTTP 400.
  // Depending on handler order, that can kill Vite's HMR handshake
  // and cause "Invalid frame header" in the browser.
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url || "");
    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
    // else: do nothing; let Vite or other listeners handle it.
  });

  wss.on("connection", (socket) => {
    courierSockets.set(socket, { orderId: null });

    socket.on("message", (raw) => {
      const msg = parseMessage(raw);
      if (!msg || typeof msg !== "object") return;

      // Protocol:
      // { type: "subscribe", role: "restaurant", orderId }
      // { type: "subscribe", role: "courier", orderId }
      // { type: "location", orderId, lat, lng }

      if (msg.type === "subscribe" && typeof msg.orderId === "number") {
        const orderId = msg.orderId as number;
        if (msg.role === "restaurant") {
          let set = orderRooms.get(orderId);
          if (!set) {
            set = new Set();
            orderRooms.set(orderId, set);
          }
          set.add(socket);
          socket.send(JSON.stringify({ type: "subscribed", orderId }));
        } else if (msg.role === "courier") {
          courierSockets.set(socket, { orderId });
          socket.send(JSON.stringify({ type: "subscribed", orderId }));
        }
        return;
      }

      if (msg.type === "location" && typeof msg.orderId === "number") {
        const { orderId, lat, lng } = msg;
        const room = orderRooms.get(orderId);
        if (room && lat != null && lng != null) {
          const payload = JSON.stringify({ type: "location", orderId, lat, lng, ts: Date.now() });
          room.forEach((client) => {
            // readyState 1 === OPEN; using numeric to avoid type namespace issues
            // @ts-ignore - WebSocket type from ws has OPEN constant at runtime, but TS may not track it here
            if ((client as any).readyState === 1) client.send(payload);
          });
        }
        return;
      }
    });

    socket.on("close", () => {
      // remove from all rooms
      orderRooms.forEach((set) => set.delete(socket));
      courierSockets.delete(socket);
    });
  });
}
