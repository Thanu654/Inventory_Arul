import express from 'express';
import { login, getAllUsers } from '../controllers/authController.js';


const router = express.Router();

router.post('/login', login);
router.get('/users', getAllUsers);


export default router;
