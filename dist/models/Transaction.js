"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const transactionSchema = new mongoose_1.Schema({
    date: Date,
    amount: Number,
    category: String,
    status: String,
    user_id: String,
    user_profile: String
});
exports.default = (0, mongoose_1.model)('Transaction', transactionSchema);
