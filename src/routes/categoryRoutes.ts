import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const categoriesRouter = Router();

categoriesRouter.get("/", getCategories);
categoriesRouter.post("/add", createCategory);
categoriesRouter.get("/:id", getCategoryById);
categoriesRouter.put("/:id", updateCategory);
categoriesRouter.delete("/:id", deleteCategory);

export default categoriesRouter;
