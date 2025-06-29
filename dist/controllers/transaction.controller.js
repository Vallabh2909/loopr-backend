"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCSV = exports.getTrends = exports.getSummary = exports.getTransactions = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const csv_writer_1 = require("csv-writer");
const getTransactions = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'desc', ...filters } = req.query;
    const query = {};
    if (filters.category)
        query.category = filters.category;
    if (filters.status)
        query.status = filters.status;
    if (filters.user_id)
        query.user_id = filters.user_id;
    if (filters.search) {
        query.$or = [
            { category: new RegExp(filters.search, 'i') },
            { status: new RegExp(filters.search, 'i') },
            { user_id: new RegExp(filters.search, 'i') }
        ];
    }
    const transactions = await Transaction_1.default.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit);
    const total = await Transaction_1.default.countDocuments(query);
    res.json({ transactions, total });
};
exports.getTransactions = getTransactions;
const getSummary = async (req, res) => {
    const [summary] = await Transaction_1.default.aggregate([
        { $group: {
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
    const byCategory = await Transaction_1.default.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const byStatus = await Transaction_1.default.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({
        totalRevenue: summary?.totalRevenue || 0,
        totalExpense: summary?.totalExpense || 0,
        byCategory,
        byStatus
    });
};
exports.getSummary = getSummary;
const getTrends = async (req, res) => {
    const { interval = 'monthly' } = req.query;
    const dateFormat = interval === 'monthly' ? '%Y-%m' : '%Y-%U';
    const trends = await Transaction_1.default.aggregate([
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
exports.getTrends = getTrends;
const exportCSV = async (req, res) => {
    const { fields, filters = {} } = req.body;
    const query = {};
    if (filters.category)
        query.category = filters.category;
    if (filters.status)
        query.status = filters.status;
    const transactions = await Transaction_1.default.find(query).select(fields.join(' '));
    const csvWriter = (0, csv_writer_1.createObjectCsvStringifier)({
        header: fields.map((field) => ({ id: field, title: field }))
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.write(csvWriter.getHeaderString());
    res.write(csvWriter.stringifyRecords(transactions.map(t => t.toObject())));
    res.end();
};
exports.exportCSV = exportCSV;
