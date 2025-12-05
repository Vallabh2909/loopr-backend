import app from './app';
import mongoose from 'mongoose';
import 'dotenv/config'
import { config } from './config';

mongoose.connect("mongodb+srv://demoUser:DemoPass123@cluster0.ajk9qeu.mongodb.net/demoApp").then(() => {
  console.log('MongoDB connected');
  app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
});
