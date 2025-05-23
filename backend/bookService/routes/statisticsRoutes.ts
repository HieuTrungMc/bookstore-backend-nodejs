import express from 'express';
import { getTopSellingBooks } from '../controllers/statisticsController';

const router = express.Router();

// Get top 5 bestselling books for a specific period (week, month, year)
router.get('/top-books/:period', (req, res, next) => {
  getTopSellingBooks(req, res).catch(next);
});

export default router;