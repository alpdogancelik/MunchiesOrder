import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { initWebSocket } from "./ws";
import { hasDatabaseConfig } from "./pgConfig";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // If DB config is missing, skip API/routes and run in client-only mode
  const hasDatabase = hasDatabaseConfig();
  let server = createServer(app);

  // Minimal /api/user fallback so the client never gets 404
  // If full routes are registered later, those can override this handler.
  app.get("/api/user", (req: any, res) => {
    const u = req.user as any;
    if (!u) return res.status(401).json({ message: "Unauthorized" });
    res.json({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      profileImageUrl: u.profileImageUrl,
    });
  });

  if (hasDatabase) {
    try {
      const { registerRoutes } = await import("./routes");
      server = await registerRoutes(app);
      log("API routes registered (DB mode)");
    } catch (e) {
      log(`Failed to register API routes, falling back to client-only mode: ${(e as Error).message}`);
      try {
        const { setupAuth } = await import("./auth");
        await setupAuth(app);
        log("Auth-only routes registered after routes failure");
      } catch (err) {
        log(`Failed to setup auth-only fallback: ${(err as Error).message}`);
      }
    }
  } else {
    log("DATABASE_URL not set. Enabling auth-only mode (no DB-backed routes)");
    try {
      const { setupAuth } = await import("./auth");
      await setupAuth(app);
      log("Auth-only routes registered (/api/user etc.)");
    } catch (e) {
      log(`Failed to setup auth-only mode: ${(e as Error).message}`);
    }
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Always respond with JSON errors but do not crash the dev server
    try {
      res.status(status).json({ message });
    } catch (_) {
      // ignore secondary errors
    }
    // Log the error instead of throwing to keep the server running in dev
    log(`Unhandled error ${status}: ${message}`);
  });

  // Defer Vite/static setup until AFTER we know the server is listening.
  // This ensures HMR attaches its websocket upgrade handler to the
  // actual HTTP server instance and avoids intermittent WS failures.
  // We still register the /api 404 handler now so API routing semantics
  // are consistent regardless of Vite timing.
  // Ensure unmatched /api routes return JSON 404 instead of HTML
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Not Found" });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const basePort = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || "127.0.0.1";
  const useReusePort = process.platform !== 'win32';

  const tryListen = (tryPort: number) => new Promise<number>((resolve, reject) => {
    const opts: any = { port: tryPort, host };
    if (useReusePort) opts.reusePort = true;

    const onError = (err: any) => {
      if (err && err.code === 'EADDRINUSE' && tryPort < basePort + 10) {
        server.off('error', onError);
        // try next port
        tryListen(tryPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    };

    server.once('error', onError);
    server.listen(opts, () => {
      server.off('error', onError);
      resolve(tryPort);
    });
  });

  try {
    const actualPort = await tryListen(basePort);
    // Initialize WebSocket hub only after the server is actually listening,
    // to avoid unhandled EADDRINUSE errors propagating from ws during port probing
    try {
      initWebSocket(server);
      log("WebSocket hub initialized at /ws");
    } catch (e) {
      log(`Failed to start WebSocket hub: ${(e as Error).message}`);
    }

    // Now that the HTTP server is bound, wire up Vite (dev) or static serving (prod)
    try {
      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }
    } catch (e) {
      log(`Failed to setup client middlewares: ${(e as Error).message}`);
    }

    log(`serving on http://${host}:${actualPort}`);
  } catch (err) {
    log(`failed to listen: ${(err as Error).message}`);
    process.exit(1);
  }
})();
