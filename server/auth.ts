import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

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

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({ 
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false, // Don't create since sessions table already exists
      tableName: 'sessions' // Use existing table name
    }),
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'username' }, // Use username instead of email
      async (username, password, done) => {
        try {
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

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

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
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
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