import { Router, Request, Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { readEmail, readPositiveAmount } from "../lib/validation";

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
    const email = readEmail(req.body?.email);
    const amount = readPositiveAmount(req.body?.amount);
    if (!email || amount === null) {
      res.status(400).json({ error: "بيانات غير صالحة" });
      return;
    }
    const [recipient] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!recipient) {
      res.status(404).json({ error: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني" });
      return;
    }
    if (recipient.id === caller.id) {
      res.status(400).json({ error: "لا يمكن التحويل إلى نفس المحفظة" });
      return;
    }
    const updatedRecipient = await db.transaction(async (transaction) => {
      const debit = await transaction
        .update(usersTable)
        .set({ walletBalance: sql`wallet_balance - ${amount.toFixed(2)}` })
        .where(sql`id = ${caller.id} AND wallet_balance >= ${amount.toFixed(2)}`)
        .returning({ id: usersTable.id });
      if (debit.length === 0) {
        return null;
      }
      const [updated] = await transaction
        .update(usersTable)
        .set({ walletBalance: sql`wallet_balance + ${amount.toFixed(2)}` })
        .where(eq(usersTable.id, recipient.id))
        .returning({ username: usersTable.username, walletBalance: usersTable.walletBalance });
      return updated;
    });
    if (!updatedRecipient) {
      res.status(400).json({ error: "الرصيد غير كافٍ" });
      return;
    }
    res.json({ recipientName: updatedRecipient.username, newBalance: parseFloat(updatedRecipient.walletBalance) });
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
    const amount = readPositiveAmount(req.body?.amount);
    if (amount === null) {
      res.status(400).json({ error: "مبلغ غير صالح" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }
    const withdrawal = await db
      .update(usersTable)
      .set({ walletBalance: sql`wallet_balance - ${amount.toFixed(2)}` })
      .where(sql`id = ${req.session.userId} AND wallet_balance >= ${amount.toFixed(2)}`)
      .returning({ walletBalance: usersTable.walletBalance });
    if (withdrawal.length === 0) {
      res.status(400).json({ error: "الرصيد غير كافٍ" });
      return;
    }
    res.json({ balance: parseFloat(withdrawal[0].walletBalance) });
  } catch (err) {
    logger.error(err, "Withdraw error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
