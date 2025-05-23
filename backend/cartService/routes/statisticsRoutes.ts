import express from 'express';
import { 
  getOrderStats, 
  getSalesStats, 
  getMonthlySalesStats, 
  getMonthlyOrderStats 
} from '../controllers/statisticsController';

const router = express.Router();

// Order statistics
router.get('/orders', getOrderStats);

// Sales statistics
router.get('/sales', getSalesStats);

// Monthly sales statistics for a specific year
router.get('/sales/:year', getMonthlySalesStats);

// Monthly order statistics for a specific year
router.get('/orders/:year', getMonthlyOrderStats);

export default router;