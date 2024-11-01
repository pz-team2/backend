import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import indexRouter from "./routes/index";
import usersRouter from "./routes/userRoutes";
import categoriesRouter from "./routes/categoriesRoutes";
import eventsRouter from "./routes/events";
import organizersRouter from "./routes/organizers";
import paymentsRouter from "./routes/payments";
import ticketsRouter from "./routes/tickets";
import authRouter from "./routes/authRoutes";

dotenv.config();

const app = express();

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Routes
app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/organizers", organizersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/tickets", ticketsRouter);



// Connect Database
const urlMongo = process.env.MONGODB_URI as string;
const port = process.env.PORT || 3500;

mongoose.connect(urlMongo)
try {
    console.log('Connect MongoDb')
    app.listen(port, () => {
        console.log(`Server Running  http://localhost:${port}`)
    })
} catch {
    console.error('Error Connecting to MongoDB or Starting Server')
}

export default app;
