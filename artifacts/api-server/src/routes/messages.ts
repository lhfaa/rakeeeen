import { Router, Request, Response } from "express";
import { db, usersTable, messagesTable, transactionsTable } from "@workspace/db";
import { eq, asc, or } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const txId = parseInt(req.params.id);

    const messages = await db
      .select({
        id: messagesTable.id,
        transactionId: messagesTable.transactionId,
        senderId: messagesTable.senderId,
        content: messagesTable.content,
        messageType: messagesTable.messageType,
        createdAt: messagesTable.createdAt,
        senderName: usersTable.username,
        senderRole: usersTable.role,
      })
      .from(messagesTable)
      .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
      .where(eq(messagesTable.transactionId, txId))
      .orderBy(asc(messagesTable.createdAt));

    res.json(
      messages.map((m) => ({
        id: m.id,
        transactionId: m.transactionId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        content: m.content,
        messageType: m.messageType,
        createdAt: m.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    logger.error(err, "List messages error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const txId = parseInt(req.params.id);
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ error: "الرسالة لا يمكن أن تكون فارغة" });
      return;
    }

    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, txId)).limit(1);
    if (!tx) {
      res.status(404).json({ error: "المعاملة غير موجودة" });
      return;
    }

    const userId = req.session.userId;
    const [caller] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    const isParticipant =
      tx.buyerId === userId || tx.sellerId === userId || tx.brokerId === userId || caller?.role === "admin";

    if (!isParticipant) {
      res.status(403).json({ error: "غير مصرح للمشاركة في هذه المعاملة" });
      return;
    }

    const [msg] = await db
      .insert(messagesTable)
      .values({
        transactionId: txId,
        senderId: userId,
        content: content.trim(),
        messageType: "text",
      })
      .returning();

    res.status(201).json({
      id: msg.id,
      transactionId: msg.transactionId,
      senderId: msg.senderId,
      senderName: caller?.username ?? "مجهول",
      senderRole: caller?.role ?? null,
      content: msg.content,
      messageType: msg.messageType,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error(err, "Send message error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
