import express from "express"
import { addCartItem, checkout, getAllCartItemsByUserId, getAllOrder, getAllOrderInfoByUserId, getOrderInfoById, removeCartItem, updateCartItemQuantity, updateOrderInfo, updateOrderStatus } from "../controllers/cartController"
const router  = express.Router()

router.get('/orders', getAllOrder)
router.post('/addcartitem', addCartItem)
router.post('/checkout', checkout)
router.get('/getallorders', getAllOrderInfoByUserId)
router.get('/getallcartitems/:userId', getAllCartItemsByUserId)
router.post('/removecartitem/:cartItemId', removeCartItem)
router.get('/getorderinfo/:id', getOrderInfoById)
router.post('/updatequantity/:id', updateCartItemQuantity)
router.post('/updateorder/:id', updateOrderInfo)
router.post('/updateorderstatus/:id', updateOrderStatus)
export default router