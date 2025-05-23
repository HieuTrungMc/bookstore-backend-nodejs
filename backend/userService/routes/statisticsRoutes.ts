import express from 'express';
import { getUserStats } from '../controllers/statisticsController';

const router = express.Router();

// Admin only routes - protected by auth middleware
router.get('/users', (req, res, next) => {
  getUserStats(req, res).catch(next);
});

export default router;