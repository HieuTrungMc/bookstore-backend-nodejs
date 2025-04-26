"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCartItem = exports.updateCartItemQuantity = exports.addCartItem = void 0;
var prismaClient_1 = require("../utils/prismaClient");
var addCartItem = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, bookId, quantity, existingItem, updatedItem, newCartItem, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, userId = _a.userId, bookId = _a.bookId, quantity = _a.quantity;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                if (!userId || !bookId || !quantity) {
                    res
                        .status(400)
                        .json({ error: "Missing required fields: userId, bookId, quantity" });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, prismaClient_1.default.cart_items.findFirst({
                        where: { user_id: userId, book_id: bookId },
                    })];
            case 2:
                existingItem = _b.sent();
                if (!existingItem) return [3 /*break*/, 4];
                return [4 /*yield*/, prismaClient_1.default.cart_items.update({
                        where: { id: existingItem.id },
                        data: { quantity: existingItem.quantity + quantity },
                    })];
            case 3:
                updatedItem = _b.sent();
                res.json({
                    success: true,
                    data: updatedItem,
                });
                return [2 /*return*/];
            case 4: return [4 /*yield*/, prismaClient_1.default.cart_items.create({
                    data: {
                        user_id: userId,
                        book_id: bookId,
                        quantity: quantity,
                    },
                })];
            case 5:
                newCartItem = _b.sent();
                res.status(200).json({
                    success: true,
                    data: newCartItem,
                });
                return [3 /*break*/, 7];
            case 6:
                error_1 = _b.sent();
                console.log(error_1);
                res.status(500).json({ success: false, message: "Error when add to cart" });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.addCartItem = addCartItem;
var updateCartItemQuantity = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cartItemId, finalQuantity, updatedItem, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cartItemId = parseInt(req.params.id);
                finalQuantity = req.body.finalQuantity;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                if (!(finalQuantity <= 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, prismaClient_1.default.cart_items.delete({ where: { id: cartItemId } })];
            case 2:
                _a.sent();
                res.status(200).json({ success: true, message: "Cart item removed" });
                return [2 /*return*/];
            case 3: return [4 /*yield*/, prismaClient_1.default.cart_items.update({
                    where: { id: cartItemId },
                    data: { quantity: finalQuantity, updated_at: new Date() },
                })];
            case 4:
                updatedItem = _a.sent();
                res.status(200).json({ success: true, data: updatedItem });
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                console.log(error_2);
                res.status(500).json({
                    success: false,
                    message: "Error when update cart item quantity",
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.updateCartItemQuantity = updateCartItemQuantity;
var removeCartItem = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cartItemId, cart, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cartItemId = req.body.cartItemId;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, prismaClient_1.default.cart_items.delete({ where: { id: cartItemId } })];
            case 2:
                cart = _a.sent();
                res.status(200).json({ success: true, message: "Cart is deleted." });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error("Error removing from cart:", error_3);
                res
                    .status(500)
                    .json({ success: false, message: "Error when delete cart items" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.removeCartItem = removeCartItem;
