import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes";
import userRoutes from './routes/userRoutes'
import cors from "cors";
import dotenv from "dotenv";
import { protect } from './middleware/authMiddleware';


dotenv.config();

const corsOptions = {
    origin: '*', // Ganti dengan origin yang sesuai
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json()); // Middleware untuk parsing JSON
app.use(express.urlencoded({ extended: true })); // Middleware untuk parsing URL-encoded

app.use('/api', authRouter); 
app.use('/api/users', protect, userRoutes);



const urlMongo = process.env.DATABASE_URL as string;
const port = process.env.PORT || 3000;
mongoose.connect(urlMongo)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    })
    .catch(err => console.log(err));

export default app;
