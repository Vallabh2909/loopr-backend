import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
  date: Date,
  amount: Number,
  category: String,
  status: String,
  user_id: String,
  user_profile: String
});

export default model('Transaction', transactionSchema);