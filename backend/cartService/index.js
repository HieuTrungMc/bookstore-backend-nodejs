"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var cartRoutes_1 = require("./routes/cartRoutes");
var PORT = process.env.PORT;
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use('/cart', cartRoutes_1.default);
app.listen(PORT, function () {
    console.log("Server running at port ".concat(PORT));
});
