import express from 'express';
import { createOrder, getOrderById, updateOrder } from '../controllers/orderController';

const router = express.Router();

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);

export default router;