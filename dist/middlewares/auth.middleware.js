"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticate = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
    jsonwebtoken_1.default.verify(token, config_1.config.accessTokenSecret, (err, decoded) => {
        if (err)
            return res.status(403).json({ message: 'Forbidden' });
        req.user = decoded;
        next();
    });
};
exports.authenticate = authenticate;
