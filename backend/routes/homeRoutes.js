import express from "express";
import { getHomeData } from "../controllers/homeController.js";

const router = express.Router();

router.get("/home", getHomeData);

export default router;
