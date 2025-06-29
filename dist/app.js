"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const transaction_route_1 = __importDefault(require("./routes/transaction.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: config_1.config.origin, credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_route_1.default);
app.use('/api/transactions', transaction_route_1.default);
exports.default = app;
