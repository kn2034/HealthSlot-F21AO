const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const winston = require('winston');
const specs = require('./src/config/swagger');
const connectDB = require('./src/config/db');
const { metricsMiddleware, getMetrics } = require('./src/middleware/metrics.middleware');
const patientRoutes = require('./src/routes/patientRoutes');
const authRoutes = require('./src/routes/auth.routes');
const admissionRoutes = require('./src/routes/admission.routes');
const wardRoutes = require('./src/routes/ward.routes');
const transferRoutes = require('./src/routes/transfer.routes');
const testRegistrationRoutes = require('./src/routes/testRegistration.routes');
const labTestRoutes = require('./src/routes/labTest.routes');
const testResultRoutes = require('./src/routes/testResult.routes');

// Create Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Body parser
app.use(express.json());

// Metrics middleware
app.use(metricsMiddleware);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Metrics endpoint
app.get('/metrics', getMetrics);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/lab/registrations', testRegistrationRoutes);
app.use('/api/lab/tests', labTestRoutes);
app.use('/api/lab/results', testResultRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Only connect to MongoDB if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

module.exports = app; 