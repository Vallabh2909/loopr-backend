"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const transaction_controller_1 = require("../controllers/transaction.controller");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authenticate, transaction_controller_1.getTransactions);
router.get('/summary', auth_middleware_1.authenticate, transaction_controller_1.getSummary);
router.get('/trends', auth_middleware_1.authenticate, transaction_controller_1.getTrends);
router.post('/export', auth_middleware_1.authenticate, transaction_controller_1.exportCSV);
exports.default = router;
