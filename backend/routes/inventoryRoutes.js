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
  getSubcategories,
  addSubcategory,
  deleteSubcategory,
  getSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  createPurchase,
  createStockPurchase,
  getPurchases,
  getPurchaseDetails,
  addPayment,
  getDuePurchases,
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

// Subcategories routes
router.get('/subcategories', getSubcategories);
router.post('/subcategories', addSubcategory);
router.delete('/subcategories/:id', deleteSubcategory);

// Suppliers routes
router.get('/suppliers', getSuppliers);
router.post('/suppliers', addSupplier);
router.put('/suppliers/:id', updateSupplier);
router.delete('/suppliers/:id', deleteSupplier);

// Purchases routes
router.post("/purchases", createPurchase);
router.get("/purchases", getPurchases);
router.get('/purchases/due', getDuePurchases);
router.get("/purchases/:id", getPurchaseDetails);
router.put("/purchases/:id", updatePurchase);
router.delete("/purchases/:id", deletePurchase);
// Receive stock (purchase from supplier) - increases item quantities
router.post('/purchases/receive', createStockPurchase);
// Record payment against a purchase
router.post('/purchases/:id/payments', addPayment);

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
