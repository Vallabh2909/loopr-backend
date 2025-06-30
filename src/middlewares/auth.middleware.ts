import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../interfaces/TokenPayload';
import { config } from '../config';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  console.log("Token :",token);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
  jwt.verify(token,config.accessTokenSecret, (err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    (req as any).user = decoded as TokenPayload;
    next();
  });
};