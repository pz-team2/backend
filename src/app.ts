import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import indexRouter from "./routes/index";
import usersRouter from "./routes/userRoutes";
import categoriesRouter from "./routes/categoryRoutes";
import routerEvent from "./routes/eventsRoutes";
import organizersRouter from "./routes/organizerRoutes";
// import paymentsRouter from "./routes/payments";
import ticketsRouter from "./routes/tickets";
import authRouter from "./routes/authRoutes";
import upload from "./middleware/uploadFile";
import { setupSwagger } from "./config/swagger";

dotenv.config();

const app = express();
setupSwagger(app);

// Middleware setup
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true })); // Express URL encoded body parser
// app.use(upload.single('picture')); // Gunakan multer untuk upload file gambar
// app.use(express.json()); // Tidak perlu karena kamu sudah menggunakan express.urlencoded

// Cors
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/events", routerEvent);
app.use("/api/organizers", organizersRouter);
// app.use("/api/payments", paymentsRouter);
app.use("/api/tickets", ticketsRouter);

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
