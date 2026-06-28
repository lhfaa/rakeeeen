import { Router, Request, Response } from "express";
import { db, usersTable, transactionsTable, messagesTable, brokersTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

async function getTransactionWithNames(id: number) {
  const [tx] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, id))
    .limit(1);

  if (!tx) return null;

  const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, tx.buyerId)).limit(1);
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, tx.sellerId)).limit(1);
  const [broker] = await db.select().from(usersTable).where(eq(usersTable.id, tx.brokerId)).limit(1);

  return {
    id: tx.id,
    title: tx.title,
    description: tx.description,
    amount: parseFloat(tx.amount),
    type: tx.type,
    status: tx.status,
    buyerId: tx.buyerId,
    sellerId: tx.sellerId,
    brokerId: tx.brokerId,
    buyerName: buyer?.username ?? null,
    sellerName: seller?.username ?? null,
    brokerName: broker?.username ?? null,
    createdAt: tx.createdAt.toISOString(),
  };
}

router.get("/stats", async (req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersTable);
    const transactions = await db.select().from(transactionsTable);
    const brokers = await db.select().from(brokersTable);

    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const completed = transactions.filter((t) => t.status === "completed" || t.status === "closed").length;
    const successRate = transactions.length > 0 ? (completed / transactions.length) * 100 : 99.9;

    res.json({
      userCount: users.length,
      transactionCount: transactions.length,
      successRate: Math.max(successRate, 99.9),
      brokerCount: brokers.length,
      totalAmount,
    });
  } catch (err) {
    logger.error(err, "Stats error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.get("/all", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const [caller] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!caller || (caller.role !== "admin" && caller.role !== "broker")) {
      res.status(403).json({ error: "ممنوع" });
      return;
    }

    const txs = await db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt));

    const results = await Promise.all(txs.map((tx) => getTransactionWithNames(tx.id)));
    res.json(results.filter(Boolean));
  } catch (err) {
    logger.error(err, "List all transactions error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const userId = req.session.userId;
    const txs = await db
      .select()
      .from(transactionsTable)
      .where(or(eq(transactionsTable.buyerId, userId), eq(transactionsTable.sellerId, userId), eq(transactionsTable.brokerId, userId)))
      .orderBy(desc(transactionsTable.createdAt));

    const results = await Promise.all(txs.map((tx) => getTransactionWithNames(tx.id)));
    res.json(results.filter(Boolean));
  } catch (err) {
    logger.error(err, "List transactions error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const { title, description, amount, type, brokerId, sellerEmail } = req.body;

    if (!title || !description || !amount || !type || !brokerId || !sellerEmail) {
      res.status(400).json({ error: "جميع الحقول مطلوبة" });
      return;
    }

    const [seller] = await db.select().from(usersTable).where(eq(usersTable.email, sellerEmail)).limit(1);
    if (!seller) {
      res.status(400).json({ error: "البائع غير موجود بهذا البريد الإلكتروني" });
      return;
    }

    const [brokerRow] = await db.select().from(brokersTable).where(eq(brokersTable.id, parseInt(brokerId))).limit(1);
    if (!brokerRow) {
      res.status(400).json({ error: "الوسيط غير موجود" });
      return;
    }

    const [tx] = await db
      .insert(transactionsTable)
      .values({
        title,
        description,
        amount: amount.toString(),
        type,
        status: "active",
        buyerId: req.session.userId,
        sellerId: seller.id,
        brokerId: brokerRow.userId,
      })
      .returning();

    await db.insert(messagesTable).values({
      transactionId: tx.id,
      senderId: req.session.userId,
      content: `تم إنشاء المعاملة "${title}" بقيمة ${amount} ريال`,
      messageType: "system",
    });

    await db.update(brokersTable).set({ transactionCount: brokerRow.transactionCount + 1 }).where(eq(brokersTable.id, brokerRow.id));

    const result = await getTransactionWithNames(tx.id);
    res.status(201).json(result);
  } catch (err) {
    logger.error(err, "Create transaction error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const id = parseInt(req.params.id);
    const result = await getTransactionWithNames(id);

    if (!result) {
      res.status(404).json({ error: "المعاملة غير موجودة" });
      return;
    }

    res.json(result);
  } catch (err) {
    logger.error(err, "Get transaction error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const [caller] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!caller || (caller.role !== "admin" && caller.role !== "broker")) {
      res.status(403).json({ error: "ممنوع" });
      return;
    }

    const id = parseInt(req.params.id);
    await db.delete(messagesTable).where(eq(messagesTable.transactionId, id));
    await db.delete(transactionsTable).where(eq(transactionsTable.id, id));

    res.json({ success: true });
  } catch (err) {
    logger.error(err, "Delete transaction error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.patch("/:id/close", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const [caller] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
    if (!caller || (caller.role !== "admin" && caller.role !== "broker")) {
      res.status(403).json({ error: "ممنوع" });
      return;
    }

    const id = parseInt(req.params.id);
    await db.update(transactionsTable).set({ status: "closed" }).where(eq(transactionsTable.id, id));

    await db.insert(messagesTable).values({
      transactionId: id,
      senderId: req.session.userId,
      content: "تم إغلاق المعاملة من قِبل الوسيط",
      messageType: "system",
    });

    const result = await getTransactionWithNames(id);
    res.json(result);
  } catch (err) {
    logger.error(err, "Close transaction error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/:id/pay", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const id = parseInt(req.params.id);
    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, id)).limit(1);

    if (!tx) {
      res.status(404).json({ error: "المعاملة غير موجودة" });
      return;
    }

    if (tx.buyerId !== req.session.userId) {
      res.status(403).json({ error: "فقط المشتري يمكنه الدفع" });
      return;
    }

    await db.update(transactionsTable).set({ status: "paid" }).where(eq(transactionsTable.id, id));

    await db.insert(messagesTable).values({
      transactionId: id,
      senderId: req.session.userId,
      content: `تم الدفع بنجاح - المبلغ ${parseFloat(tx.amount)} ريال محجوز في الضمان`,
      messageType: "payment",
    });

    const result = await getTransactionWithNames(id);
    res.json(result);
  } catch (err) {
    logger.error(err, "Pay transaction error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
