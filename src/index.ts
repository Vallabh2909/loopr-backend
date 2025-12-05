import app from './app';
import mongoose from 'mongoose';
import 'dotenv/config'
import { config } from './config';

mongoose.connect("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").then(() => {
  console.log('MongoDB connected');
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
});
