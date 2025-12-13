import express from "express";
import { addStaff, getAllStaff, updateStaff, deleteStaff } from "../controllers/staffController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/verifyRole.js";

const router = express.Router();

router.post("/add-staff", verifyToken, isAdmin, addStaff);
router.get("/staff", verifyToken, isAdmin, getAllStaff);
router.put("/staff/:id", verifyToken, isAdmin, updateStaff);
router.delete("/staff/:id", verifyToken, isAdmin, deleteStaff);

export default router;
