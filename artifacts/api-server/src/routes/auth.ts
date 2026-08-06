import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { readEmail, readString } from "../lib/validation";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const router = Router();

function publicUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    countryCode: user.countryCode,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const username = readString(req.body?.username, { min: 3, max: 80 });
    const email = readEmail(req.body?.email);
    const password = readString(req.body?.password, { min: 8, max: 128 });
    const phone = readString(req.body?.phone, { min: 5, max: 32 });
    const countryCode = readString(req.body?.countryCode, { min: 2, max: 8 });

    if (!username || !email || !password || !phone || !countryCode) {
      res.status(400).json({ error: "جميع الحقول مطلوبة" });
      return;
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existing.length > 0) {
      res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      return;
    }

    const existingUsername = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      res.status(400).json({ error: "اسم المستخدم مستخدم بالفعل" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(usersTable)
      .values({
        username,
        email,
        passwordHash,
        phone,
        countryCode,
        role: "user",
      })
      .returning();

    req.session.regenerate((error) => {
      if (error) {
        logger.error({ err: error }, "Register session error");
        res.status(500).json({ error: "حدث خطأ في الخادم" });
        return;
      }
      req.session.userId = user.id;
      res.status(201).json({ user: publicUser(user) });
    });
  } catch (err) {
    logger.error(err, "Register error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const email = readEmail(req.body?.email);
    const password = readString(req.body?.password, { min: 1, max: 128 });

    if (!email || !password) {
      res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      return;
    }

    req.session.regenerate((error) => {
      if (error) {
        logger.error({ err: error }, "Login session error");
        res.status(500).json({ error: "حدث خطأ في الخادم" });
        return;
      }
      req.session.userId = user.id;
      res.json({ user: publicUser(user) });
    });
  } catch (err) {
    logger.error(err, "Login error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((error) => {
    if (error) {
      logger.error({ err: error }, "Logout error");
      res.status(500).json({ error: "حدث خطأ في الخادم" });
      return;
    }
    res.json({ success: true });
  });
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "المستخدم غير موجود" });
      return;
    }

    res.json(publicUser(user));
  } catch (err) {
    logger.error(err, "Get me error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
