import express from "express";
import { upload } from '../config/upload.js';
import { 
  getItems, 
  addItem, 
  updateItem, 
  deleteItem, 
  getCategories, 
  addCategory, 
  deleteCategory,
  createPurchase,
  getPurchases,
  getPurchaseDetails,
  updatePurchase,
  deletePurchase,
  getAlertSettings,
  updateAlertSettings,
  getLowStockItems,
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  getDashboardSummary
} from "../controllers/inventoryController.js";
import {
  getDeliveryPrices,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  deleteDelivery
} from "../controllers/deliveryController.js";

const router = express.Router();

// Dashboard route
router.get("/dashboard", getDashboardSummary);

// Items routes
router.get("/items", getItems);
router.post("/items", upload.single('image'), addItem);
router.put("/items/:id", upload.single('image'), updateItem);
router.delete("/items/:id", deleteItem);

// Categories routes
router.get("/categories", getCategories);
router.post("/categories", addCategory);
router.delete("/categories/:id", deleteCategory);

// Purchases routes
router.post("/purchases", createPurchase);
router.get("/purchases", getPurchases);
router.get("/purchases/:id", getPurchaseDetails);
router.put("/purchases/:id", updatePurchase);
router.delete("/purchases/:id", deletePurchase);

// Alert/Notification routes
router.get("/alert-settings", getAlertSettings);
router.post("/alert-settings", updateAlertSettings);
router.get("/low-stock-items", getLowStockItems);

// Offers routes
router.get("/offers", getOffers);
router.get("/offers/:id", getOfferById);
router.post("/offers", createOffer);
router.put("/offers/:id", updateOffer);
router.delete("/offers/:id", deleteOffer);

// Delivery / Country price conditions routes
router.get("/delivery", getDeliveryPrices);
router.get("/delivery/:id", getDeliveryById);
router.post("/delivery", upload.single('image'), createDelivery);
router.put("/delivery/:id", upload.single('image'), updateDelivery);
router.delete("/delivery/:id", deleteDelivery);

export default router;
