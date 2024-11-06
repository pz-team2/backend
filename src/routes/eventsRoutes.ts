import express, { Request, Response } from 'express'
import { Router } from "express";
import { tambahEvent } from "../controllers/eventController";
import upload from "../middleware/uploadFile";

const routerEvent = Router()

// const uploadComplaint = createUploadMiddleware('uploads', ['image/jpeg', 'image/png'], 5 * 1024 * 1024);
routerEvent.post('/add', upload.single('picture'), tambahEvent, (req: Request, res: Response): void => {
    // Ensure that req.file contains the uploaded file
    if (req.file) {
        res.status(200).json({ message: 'File uploaded successfully', file: req.file })
    } else {
        res.status(400).json({ message: 'No file uploaded' })
    }
})

export default routerEvent