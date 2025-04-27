import express from 'express';
import { signup, login, getAccountInfo, changePassword, getCurrentUser, getUserById } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.post('/signup', async (req, res, next) => {
  try {
    await signup(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/account/:email', async (req, res, next) => {
  try {
    await getAccountInfo(req, res);
  } catch (error) {
    next(error);
  }
});

// New route to get user by ID
router.get('/user/:id', async (req, res, next) => {
  try {
    await getUserById(req, res);
  } catch (error) {
    next(error);
  }
});

// Protected routes (require authentication)
router.post('/change-password', (req, res, next) => {
  authenticateToken(req, res, next);
}, async (req, res, next) => {
  try {
    await changePassword(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/profile', (req, res, next) => {
  authenticateToken(req, res, next);
}, async (req, res, next) => {
  try {
    await getCurrentUser(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;