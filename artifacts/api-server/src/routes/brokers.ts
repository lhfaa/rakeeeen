import { Router, Request, Response } from "express";
import { db, usersTable, brokersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { getRouteParam } from "../lib/route-params";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select({
        id: brokersTable.id,
        userId: brokersTable.userId,
        username: usersTable.username,
        email: usersTable.email,
        phone: usersTable.phone,
        transactionCount: brokersTable.transactionCount,
        successRate: brokersTable.successRate,
        avgTime: brokersTable.avgTime,
        rating: brokersTable.rating,
        createdAt: brokersTable.createdAt,
      })
      .from(brokersTable)
      .innerJoin(usersTable, eq(brokersTable.userId, usersTable.id));

    res.json(
      rows.map((b) => ({
        id: b.id,
        userId: b.userId,
        username: b.username,
        email: b.email,
        phone: b.phone,
        transactionCount: b.transactionCount,
        successRate: parseFloat(b.successRate ?? "99"),
        avgTime: b.avgTime,
        rating: parseFloat(b.rating ?? "4.9"),
        createdAt: b.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    logger.error(err, "List brokers error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const [caller] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId))
      .limit(1);

    if (!caller || caller.role !== "admin") {
      res.status(403).json({ error: "ممنوع - المسؤول فقط" });
      return;
    }

    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "معرف المستخدم مطلوب" });
      return;
    }

    const [targetUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, parseInt(userId)))
      .limit(1);

    if (!targetUser) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    await db
      .update(usersTable)
      .set({ role: "broker" })
      .where(eq(usersTable.id, parseInt(userId)));

    const [broker] = await db
      .insert(brokersTable)
      .values({ userId: parseInt(userId) })
      .returning();

    const [brokerRow] = await db
      .select({
        id: brokersTable.id,
        userId: brokersTable.userId,
        username: usersTable.username,
        email: usersTable.email,
        phone: usersTable.phone,
        transactionCount: brokersTable.transactionCount,
        successRate: brokersTable.successRate,
        avgTime: brokersTable.avgTime,
        rating: brokersTable.rating,
        createdAt: brokersTable.createdAt,
      })
      .from(brokersTable)
      .innerJoin(usersTable, eq(brokersTable.userId, usersTable.id))
      .where(eq(brokersTable.id, broker.id));

    res.status(201).json({
      id: brokerRow.id,
      userId: brokerRow.userId,
      username: brokerRow.username,
      email: brokerRow.email,
      phone: brokerRow.phone,
      transactionCount: brokerRow.transactionCount,
      successRate: parseFloat(brokerRow.successRate ?? "99"),
      avgTime: brokerRow.avgTime,
      rating: parseFloat(brokerRow.rating ?? "4.9"),
      createdAt: brokerRow.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error(err, "Create broker error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }

    const [caller] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId))
      .limit(1);

    if (!caller || caller.role !== "admin") {
      res.status(403).json({ error: "ممنوع - المسؤول فقط" });
      return;
    }

    const brokerId = parseInt(getRouteParam(req.params.id) ?? "", 10);
    const [broker] = await db
      .select()
      .from(brokersTable)
      .where(eq(brokersTable.id, brokerId))
      .limit(1);

    if (!broker) {
      res.status(404).json({ error: "الوسيط غير موجود" });
      return;
    }

    await db.update(usersTable).set({ role: "user" }).where(eq(usersTable.id, broker.userId));
    await db.delete(brokersTable).where(eq(brokersTable.id, brokerId));

    res.json({ success: true });
  } catch (err) {
    logger.error(err, "Delete broker error");
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

export default router;
