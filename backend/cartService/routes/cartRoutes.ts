import express from "express"
import { addCartItem, checkout, getAllOrderInfoByUserId, getOrderInfoById, removeCartItem, updateCartItemQuantity, updateOrderInfo, updateOrderStatus } from "../controllers/cartController"
const router  = express.Router()

router.post('/addcartitem', addCartItem)
router.post('/removecartitem', removeCartItem)
router.post('/checkout', checkout)
router.get('/getallorders', getAllOrderInfoByUserId)
router.get('/getorderinfo/:id', getOrderInfoById)
router.post('/updatequantity/:id', updateCartItemQuantity)
router.post('/updateorder/:id', updateOrderInfo)
router.post('/updateorderstatus/:id', updateOrderStatus)
export default router