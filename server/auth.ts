import * as passportNS from "passport";
// Support both ESM and CJS builds of passport
const passport: typeof import("passport") = (passportNS as any).default ?? (passportNS as any);
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { Pool } from "pg";
import { buildPgConfig, hasDatabaseConfig } from "./pgConfig";

declare global {
  namespace Express {
    interface User extends SelectUser { }
  }
}

const scryptAsync = promisify(scrypt);

// Resolve storage dynamically so we can run without a single DATABASE_URL
const getStorage = (() => {
  let cached: any | null = null;
  return async () => {
    if (cached) return cached;
    if (hasDatabaseConfig()) {
      const mod = await import("./storage.ts");
      cached = mod.storage;
    } else {
      const mod = await import("./storage.memory.ts");
      cached = mod.memoryStorage;
    }
    return cached;
  };
})();

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function isDbReachable(): Promise<boolean> {
  const cfg = buildPgConfig();
  if (!cfg) return false;
  const pool = new Pool({ ...(cfg as any), max: 1, idleTimeoutMillis: 1000, connectionTimeoutMillis: 2000 });
  try {
    await pool.query("SELECT 1");
    await pool.end();
    return true;
  } catch {
    try { await pool.end(); } catch { }
    return false;
  }
}

export async function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  const MemoryStore = createMemoryStore(session);

  // Prefer DB-backed sessions when the database is actually reachable; otherwise fall back to memory.
  const useDb = hasDatabaseConfig() && await isDbReachable();
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dev-insecure-secret",
    resave: false,
    saveUninitialized: false,
    store: useDb
      ? new PostgresSessionStore({
        // Use conObject in favor of a single connection string
        conObject: buildPgConfig() as any,
        createTableIfMissing: true,
        tableName: "sessions",
      })
      : new MemoryStore({ checkPeriod: 24 * 60 * 60 * 1000 }),
    cookie: {
      httpOnly: true,
      secure: false, // set true in prod with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Lightweight health check to verify auth routes are mounted
  app.get("/api/__health_auth", (_req, res) => {
    res.json({ ok: true, mode: useDb ? "db" : "memory" });
  });

  passport.use(
    new LocalStrategy(
      { usernameField: 'username' }, // Use username instead of email
      async (username, password, done) => {
        try {
          const storage = await getStorage();
          const user = await storage.getUserByUsername(username);
          if (!user || !(await comparePasswords(password, user.password))) {
            // Log failed login attempt
            await storage.createSecurityLog({
              userId: user?.id || null,
              event: 'failed_login',
              ipAddress: null,
              userAgent: null,
              details: { username, reason: 'invalid_credentials' }
            });
            return done(null, false);
          } else {
            // Log successful login
            await storage.createSecurityLog({
              userId: user.id,
              event: 'login',
              ipAddress: null,
              userAgent: null,
              details: { username }
            });
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done: (err: any, id?: any) => void) => done(null, user.id));
  passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const storage = await getStorage();
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Explicitly document that this endpoint expects POST JSON
  app.get("/api/register", (_req, res) => {
    res.status(405).json({ message: "Use POST with JSON body to register" });
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      const storage = await getStorage();

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }

      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create user with hashed password
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        username,
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
      });

      // Log registration
      await storage.createSecurityLog({
        userId: newUser.id,
        event: 'registration',
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
        details: { username, email }
      });

      req.login(newUser, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          profileImageUrl: newUser.profileImageUrl
        });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const isDev = (process.env.NODE_ENV || 'development') === 'development';
      // Handle unique constraint errors gracefully
      const msg = String(error?.message || "");
      const code = (error && (error.code || error.sqlState)) || undefined;
      if (code === '23505' || /duplicate key value/i.test(msg)) {
        return res.status(400).json({ message: "Username or email already exists" });
      }
      res.status(500).json({ message: "Internal server error", detail: isDev ? msg : undefined });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    if (req.user) {
      const storage = await getStorage();
      // Log logout
      await storage.createSecurityLog({
        userId: req.user.id,
        event: 'logout',
        ipAddress: req.ip || null,
        userAgent: req.get('User-Agent') || null,
        details: { username: req.user.username }
      });
    }

    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as SelectUser;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl
    });
  });
}