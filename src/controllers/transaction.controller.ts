import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { createObjectCsvStringifier } from 'csv-writer';

export const getTransactions = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', ...filters } = req.query;
  const query: any = {};

  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.user_id) query.user_id = filters.user_id;
  if (filters.search) {
    query.$or = [
      { category: new RegExp(filters.search as string, 'i') },
      { status: new RegExp(filters.search as string, 'i') },
      { user_id: new RegExp(filters.search as string, 'i') }
    ];
  }

  const transactions = await Transaction.find(query)
    .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await Transaction.countDocuments(query);

  res.json({ transactions, total });
};

export const getSummary = async (req: Request, res: Response) => {
  const [summary] = await Transaction.aggregate([
    {      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0] }
        },
        totalExpense: {
          $sum: { $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0] }
        }
      }
    }
  ]);

  const byCategory = await Transaction.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  const byStatus = await Transaction.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  res.json({
    totalRevenue: summary?.totalRevenue || 0,
    totalExpense: summary?.totalExpense || 0,
    byCategory,
    byStatus
  });
};

export const getTrends = async (req: Request, res: Response) => {
  const { interval = 'monthly' } = req.query;
  const dateFormat = interval === 'monthly' ? '%Y-%m' : '%Y-%U';

  const trends = await Transaction.aggregate([
    {
      $match: {
        date: { $type: 'date' }
      }
    },
    {
      $group: {
        _id: {
          period: { $dateToString: { format: dateFormat, date: "$date" } },
          category: "$category"
        },
        total: { $sum: "$amount" }
      }
    },
    {
      $group: {
        _id: "$_id.period",
        values: {
          $push: { k: "$_id.category", v: "$total" }
        }
      }
    },
    {
      $sort: {
        _id: 1 // ascending order by period
      }
    },
    {
      $project: {
        period: "$_id",
        _id: 0,
        data: { $arrayToObject: "$values" }
      }
    }
  ]);

  res.json(trends.map(t => ({ period: t.period, ...t.data })));
};


export const exportCSV = async (req: Request, res: Response) => {

  const { fields, filters = {} } = req.body;
  const query: any = {};

  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;

  const transactions = await Transaction.find(query).select(fields.join(' '));

  const csvWriter = createObjectCsvStringifier({
    header: fields.map((field: string) => ({ id: field, title: field }))
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');

  res.write(csvWriter.getHeaderString());
  res.write(csvWriter.stringifyRecords(transactions.map(t => t.toObject())));
  res.end();
};
