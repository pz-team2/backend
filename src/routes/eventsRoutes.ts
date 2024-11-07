import express, { Request, Response } from 'express'
import { Router } from "express";
import { tambahEvent } from "../controllers/eventController";
import upload from "../middleware/uploadFile";
import apiResponse from '../utils/apiResource';

const routerEvent = Router()

routerEvent.post('/add', upload.single('picture'), tambahEvent, (req: Request, res: Response): void => {
    if (req.file) {
        res.status(200).json(apiResponse(true, 'File Berhasil DI Upload',  req.file) )
    } else {
        res.status(400).json(apiResponse(false, 'File Gagal Di Upload'))
    }
})

export default routerEvent