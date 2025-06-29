"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const config_1 = require("../config");
const ACCESS_TOKEN_SECRET = config_1.config.accessTokenSecret;
const REFRESH_TOKEN_SECRET = config_1.config.refreshTokenSecret;
const REFRESH_TOKEN_EXPIRE = '7d';
const ACCESS_TOKEN_EXPIRE = '15m';
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
    return { accessToken, refreshToken };
};
const register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = new User_1.default({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered' });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const tokens = generateTokens(user._id.toString());
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.json({ message: 'Login successful' });
};
exports.login = login;
const getMe = async (req, res) => {
    const user = req.user;
    res.status(200).json({
        userId: user.userId,
        message: "Authenticated",
    });
};
exports.getMe = getMe;
const refreshToken = (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err)
            return res.status(403).json({ message: 'Forbidden' });
        const { userId } = decoded;
        const tokens = generateTokens(userId);
        res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
        res.json({ message: 'Token refreshed' });
    });
};
exports.refreshToken = refreshToken;
const logout = (req, res) => {
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Logged out' });
};
exports.logout = logout;
