import express from 'express'; // Ganti require dengan import
import Category from '../models/Category';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error: unknown) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/', async (req: express.Request, res: express.Response) => {
  const category = new Category({
    name: req.body.name,
  });
  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error: unknown) {
    res.status(400).json({ message: (error as Error).message });
  }
});

export default router; // Ubah menjadi export default
