import app from './app';
import mongoose from 'mongoose';
import 'dotenv/config'
import { config } from './config';

mongoose.connect("process.env.GITHUB_TOKEN").then(() => {
  console.log('MongoDB connected');
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
});
