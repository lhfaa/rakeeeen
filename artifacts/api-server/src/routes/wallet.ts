import { Router, Request, Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }
    res.json({ balance: parseFloat(user.walletBalance) });
  } catch (err) {
    logger.error(err, "Get wallet error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/broker-transfer", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }
    const [caller] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!caller || (caller.role !== "broker" && caller.role !== "admin")) {
      res.status(403).json({ error: "فقط الوسيط يمكنه إجراء هذا التحويل" });
      return;
    }
    const { email, amount } = req.body;
    if (!email || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: "بيانات غير صالحة" });
      return;
    }
    const [recipient] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!recipient) {
      res.status(404).json({ error: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني" });
      return;
    }
    const newBalance = (parseFloat(recipient.walletBalance) + Number(amount)).toFixed(2);
    await db.update(usersTable).set({ walletBalance: newBalance }).where(eq(usersTable.id, recipient.id));
    res.json({ recipientName: recipient.username, newBalance: parseFloat(newBalance) });
  } catch (err) {
    logger.error(err, "Broker transfer error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: "مبلغ غير صالح" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }
    const current = parseFloat(user.walletBalance);
    const withdraw = Number(amount);
    if (withdraw > current) {
      res.status(400).json({ error: "الرصيد غير كافٍ" });
      return;
    }
    const newBalance = (current - withdraw).toFixed(2);
    await db.update(usersTable).set({ walletBalance: newBalance }).where(eq(usersTable.id, req.session.userId));
    res.json({ balance: parseFloat(newBalance) });
  } catch (err) {
    logger.error(err, "Withdraw error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
