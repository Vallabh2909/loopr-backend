import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getTransactions,
  getSummary,
  getTrends,
  exportCSV
} from '../controllers/transaction.controller';

const router = Router();

router.get('/', authenticate, getTransactions);
router.get('/summary', authenticate, getSummary);
router.get('/trends', authenticate, getTrends);
router.post('/export', authenticate, exportCSV);

export default router;