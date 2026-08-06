import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "node:path";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const corsOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (corsOrigins.length > 0) {
  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, !origin || corsOrigins.includes(origin));
      },
      credentials: true,
    }),
  );
}

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }),
);

app.use("/api", router);
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "المسار غير موجود" });
});

const frontendDist =
  process.env.FRONTEND_DIST ??
  path.resolve(process.cwd(), "artifacts/rakeen/dist/public");

if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: "index.html" }));
  app.get(/^\/(?!api(?:\/|$)).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "Unhandled request error");
  if (res.headersSent) return;
  res.status(500).json({ error: "حدث خطأ في الخادم" });
});

export default app;
