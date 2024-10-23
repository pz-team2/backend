import { Router } from 'express';

const authControllers  = require('../controllers/authControllers');
const router = Router();

router.post('/register', authControllers.Register);
router.post('/login', authControllers.Login);

export default router;
