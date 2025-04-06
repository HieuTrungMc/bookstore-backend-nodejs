import express from "express"
import { addCartItem, removeCartItem, updateCartItemQuantity } from "../controllers/cartController"
const router  = express.Router()

router.post('/addcartitem', addCartItem)
router.post('/removecartitem', removeCartItem)
router.post('/updatequantity/:id', updateCartItemQuantity)

export default router