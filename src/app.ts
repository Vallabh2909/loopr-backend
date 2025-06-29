import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import transactionRoutes from './routes/transaction.route';
import cookieParser from 'cookie-parser';
import { config } from './config';

const app = express();
app.use(cors({ origin:config.origin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

export default app;