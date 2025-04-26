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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.changePassword = exports.getUserById = exports.getAccountInfo = exports.login = exports.signup = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const authUtils_1 = require("../utils/authUtils");
// Register a new user
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, name, email } = req.body;
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        // Check if username already exists
        const existingUser = yield client_1.default.users.findFirst({
            where: { username }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        // Check if email already exists (if provided)
        if (email) {
            const existingEmail = yield client_1.default.users.findFirst({
                where: { email }
            });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }
        // Hash the password
        const hashedPassword = yield (0, authUtils_1.hashPassword)(password);
        // Create the user
        const newUser = yield client_1.default.users.create({
            data: {
                username,
                password: hashedPassword,
                name: name || null,
                email: email || null,
                status: 1 // Active status
            }
        });
        // Generate JWT token
        const token = (0, authUtils_1.generateToken)(newUser.id);
        // Return user data (excluding password) and token
        const { password: _ } = newUser, userData = __rest(newUser, ["password"]);
        res.status(201).json({
            message: 'User registered successfully',
            user: userData,
            token
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.signup = signup;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        // Find the user
        const user = yield client_1.default.users.findFirst({
            where: { email: username }
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Check if account is active
        if (user.status !== 1) {
            return res.status(401).json({ message: 'Account is inactive' });
        }
        // Verify password
        const isPasswordValid = yield (0, authUtils_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate JWT token
        const token = (0, authUtils_1.generateToken)(user.id);
        // Return user data (excluding password) and token
        const { password: _ } = user, userData = __rest(user, ["password"]);
        res.status(200).json({
            message: 'Login successful',
            user: userData,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
// Get account info by email
const getAccountInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        // Find the user by email
        const user = yield client_1.default.users.findFirst({
            where: { email },
            include: {
                addresses: true // Include user addresses
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return user data (excluding password)
        const { password } = user, userData = __rest(user, ["password"]);
        res.status(200).json({
            user: userData
        });
    }
    catch (error) {
        console.error('Get account info error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAccountInfo = getAccountInfo;
// Get user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        // Find the user by ID
        const user = yield client_1.default.users.findUnique({
            where: { id: userId },
            include: {
                addresses: true // Include user addresses
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return user data (excluding password)
        const { password } = user, userData = __rest(user, ["password"]);
        res.status(200).json({
            user: userData
        });
    }
    catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getUserById = getUserById;
// Change password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        // Find the user
        const user = yield client_1.default.users.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify current password
        const isPasswordValid = yield (0, authUtils_1.comparePassword)(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        // Hash the new password
        const hashedPassword = yield (0, authUtils_1.hashPassword)(newPassword);
        // Update the password
        yield client_1.default.users.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.changePassword = changePassword;
// Get current user profile (for authenticated users)
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const userId = req.user.userId;
        // Find the user
        const user = yield client_1.default.users.findUnique({
            where: { id: userId },
            include: {
                addresses: true // Include user addresses
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return user data (excluding password)
        const { password } = user, userData = __rest(user, ["password"]);
        res.status(200).json({
            user: userData
        });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getCurrentUser = getCurrentUser;
