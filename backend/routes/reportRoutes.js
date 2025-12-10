import express from 'express';
import reportController from '../controllers/reportController.js';

const router = express.Router();

// GET /api/reports/products -> product level sales/purchase/profit
router.get('/reports/products', reportController.productReport);

// GET /api/reports/product-history?itemId= or ?itemName= -> single product chronological history
router.get('/reports/product-history', reportController.productHistory);

// GET /api/reports/profit?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/reports/profit', reportController.profitReport);

// GET /api/reports/sales?startDate=&endDate=&customer=
router.get('/reports/sales', reportController.salesReport);

// GET /api/reports/profit-summary -> invoice-level profit with expenses summary
router.get('/reports/profit-summary', reportController.profitSummaryReport);

// Expenses endpoints
router.get('/reports/expenses', reportController.getExpenses);
router.post('/reports/expenses', reportController.addExpense);

export default router;
