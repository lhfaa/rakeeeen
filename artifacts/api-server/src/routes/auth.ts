import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, brokersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, email, password, phone, countryCode } = req.body;

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

    req.session.userId = user.id;

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    logger.error(err, "Register error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

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

    req.session.userId = user.id;

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        countryCode: user.countryCode,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    logger.error(err, "Login error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
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

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      countryCode: user.countryCode,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error(err, "Get me error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
