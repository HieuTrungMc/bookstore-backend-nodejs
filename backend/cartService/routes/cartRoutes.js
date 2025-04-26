"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cartController_1 = require("../controllers/cartController");
var router = express_1.default.Router();
router.post('/addcartitem', cartController_1.addCartItem);
router.post('/removecartitem', cartController_1.removeCartItem);
router.post('/updatequantity/:id', cartController_1.updateCartItemQuantity);
exports.default = router;
