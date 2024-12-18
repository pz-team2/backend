import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import usersRouter from "./routes/userRoutes";
import categoriesRouter from "./routes/categoryRoutes";
import routerEvent from "./routes/eventsRoutes";
import organizersRouter from "./routes/organizerRoutes";
import dashboardRouter from "./routes/dashboardRoutes";
import authRouter from "./routes/authRoutes";
import { setupSwagger } from "./config/swagger";
import routerPayment from "./routes/paymentRoutes";
import path from "path";
import { protect } from "./middleware/authMiddleware";
import { protectOragnizer } from "./middleware/middlewareOrganizer";
import ticketRouter from "./routes/ticketRoutes";

dotenv.config();

const app = express();
setupSwagger(app);

// Middleware setup
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cors
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/events", routerEvent);
app.use("/api/organizers", organizersRouter);
app.use("/api/payments", routerPayment);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/tickets", ticketRouter);

// Connect Database
const urlMongo = process.env.MONGODB_URI as string;
const port = process.env.PORT || 3500;

mongoose.connect(urlMongo);
try {
  console.log("Connect MongoDb");
  app.listen(port, () => {
    console.log(`Server Running  http://localhost:${port}`);
  });
} catch {
  console.error("Error Connecting to MongoDB or Starting Server");
}

export default app;
