"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const config_1 = require("./config");
mongoose_1.default.connect(config_1.config.mongoUri).then(() => {
    console.log('MongoDB connected');
    app_1.default.listen(config_1.config.port, () => console.log(`Server running on port ${config_1.config.port}`));
});
