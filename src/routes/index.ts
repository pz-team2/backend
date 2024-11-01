import express, { Request, Response } from "express";
import categoriesRouter from "./categoriesRoutes";
import eventsRouter from "./events";
import organizersRouter from "./organizers";
import paymentsRouter from "./payments";
import ticketsRouter from "./tickets";
import usersRouter from "./userRoutes";

const router = express.Router();

router.use("/categories", categoriesRouter);
router.use("/events", eventsRouter);
router.use("/organizers", organizersRouter);
router.use("/payments", paymentsRouter);
router.use("/tickets", ticketsRouter);
router.use("/users", usersRouter);

router.get("/", (req: Request, res: Response) => {
  res.send("API Root");
});

export default router;
