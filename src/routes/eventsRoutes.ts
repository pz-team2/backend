import { Router } from "express";
import { tambahEvent } from "../controllers/eventContoller";
import createUploadMiddleware from "../middleware/uploadFile";
import upload from "../middleware/uploadFile";

const routerEvent = Router()

// const uploadComplaint = createUploadMiddleware('uploads', ['image/jpeg', 'image/png'], 5 * 1024 * 1024);
routerEvent.post('/add',upload.single('picture'), tambahEvent)

export default routerEvent