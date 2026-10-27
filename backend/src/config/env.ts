import dotenv from 'dotenv';

// Silence Dotenv banner/logs in modern Node.js versions
dotenv.config({ quiet: true } as dotenv.DotenvConfigOptions);

export const ENV = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/marketplace',
  JWT_SECRET: process.env.JWT_SECRET || 'lab-secret-jwt-key-development-2026',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
