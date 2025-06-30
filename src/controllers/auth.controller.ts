import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { TokenPayload } from '../interfaces/TokenPayload';
import { config } from '../config';

const ACCESS_TOKEN_SECRET = config.accessTokenSecret;
const REFRESH_TOKEN_SECRET = config.refreshTokenSecret;
const REFRESH_TOKEN_EXPIRE = '7d';
const ACCESS_TOKEN_EXPIRE = '15m';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: 'User registered' });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const tokens = generateTokens(user._id.toString());
  res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000});
  res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 15 * 60 * 1000 });
  res.json({ message: 'Login successful' });
};

export const getMe = async (req: Request, res: Response) => {
  const user = (req as any).user;

  res.status(200).json({
    userId: user.userId,
    message: "Authenticated",
  });
};

export const refreshToken = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err:any, decoded: any) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    const { userId } = decoded as TokenPayload;
    const tokens = generateTokens(userId);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 15 * 60 * 1000 });
    res.json({ message: 'Token refreshed' });
  });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  res.status(200).json({ message: 'Logged out' });
};