const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const winston = require('winston');

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8081', 10);

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    logger.error('Server failed to start:', err);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = server; 