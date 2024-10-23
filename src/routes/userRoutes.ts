import { Router } from 'express';
const profileController  = require('../controllers/profileController');

const router = Router();

router.post('/profile', profileController.profile);

export default router;
