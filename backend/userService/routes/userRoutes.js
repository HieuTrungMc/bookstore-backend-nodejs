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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public routes
router.post('/signup', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.signup)(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.login)(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/account/:email', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.getAccountInfo)(req, res);
    }
    catch (error) {
        next(error);
    }
}));
// New route to get user by ID
router.get('/user/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.getUserById)(req, res);
    }
    catch (error) {
        next(error);
    }
}));
// Protected routes (require authentication)
router.post('/change-password', (req, res, next) => {
    (0, authMiddleware_1.authenticateToken)(req, res, next);
}, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.changePassword)(req, res);
    }
    catch (error) {
        next(error);
    }
}));
router.get('/profile', (req, res, next) => {
    (0, authMiddleware_1.authenticateToken)(req, res, next);
}, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, userController_1.getCurrentUser)(req, res);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
