import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import brokersRouter from "./brokers";
import transactionsRouter from "./transactions";
import messagesRouter from "./messages";
import walletRouter from "./wallet";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/brokers", brokersRouter);
router.use("/transactions", transactionsRouter);
router.use("/transactions/:id/messages", messagesRouter);
router.use("/wallet", walletRouter);

export default router;
