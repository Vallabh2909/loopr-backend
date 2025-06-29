"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// config.ts
require("dotenv/config");
function ensureEnvVar(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.config = {
    mongoUri: ensureEnvVar('MONGO_URI'),
    port: parseInt(process.env.PORT || '5000', 10),
    accessTokenSecret: ensureEnvVar('ACCESS_TOKEN_SECRET'),
    refreshTokenSecret: ensureEnvVar('REFRESH_TOKEN_SECRET'),
    origin: ensureEnvVar('ORIGIN'),
};
