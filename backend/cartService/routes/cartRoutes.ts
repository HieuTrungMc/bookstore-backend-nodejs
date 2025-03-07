import express from "express"
import { addToCart, removeFromCart } from "../controllers/cartController"
const router  = express.Router()

router.post('/addtocart', addToCart)
router.post('/removefromcart', removeFromCart)

export default router