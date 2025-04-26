"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const PORT = process.env.PORT || 5001;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/book', bookRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
