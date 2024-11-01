import { Router } from "express";
import { dataCategories, tambahCategories } from "../controllers/categoriesController";

const categoriesRouter = Router()

categoriesRouter.get('/data', dataCategories)
categoriesRouter.post('/tambah', tambahCategories)

export  default categoriesRouter; 