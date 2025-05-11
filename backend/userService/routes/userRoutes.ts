import express from 'express';
import {
  signup,
  login,
  getAccountInfo,
  changePassword,
  getCurrentUser,
  getUserById,
  getAllPosts,
  createPost,
  deletePost,
  updatePost,
  uploadImage,
  getAllAttachments,
  updateUser,
  addNewAddress,
  updateAddress,
  deleteAddress,
  getAllAdressByUserId
} from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import upload from "../middleware/upload";

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

router.get('/allpost', getAllPosts)
router.put('/updateuser/:id', updateUser)
router.post('/addnewaddress', addNewAddress)
router.put('/updateaddress/:addressId', updateAddress)
router.post('/deleteaddress/:addressId', deleteAddress)
router.post('/createpost', createPost)
router.post('/deletepost/:id', deletePost)
router.post('/updatepost/:id', updatePost)
router.get('/alladdress/:userId', getAllAdressByUserId)

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

// Updated route to include userId as a path parameter
router.post('/upload/:id', upload, async (req, res, next) => {
  try {
    await uploadImage(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/uploads', async (req, res, next) => {
  try {
    await getAllAttachments(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
