import express from 'express';
import { login, addStaff } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/verifyRole.js';

const router = express.Router();

router.post('/login', login);
router.post('/add-staff', verifyToken, isAdmin, addStaff);

export default router;
