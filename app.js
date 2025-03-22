const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');
const morgan = require('morgan');
const specs = require('./src/config/swagger');
const connectDB = require('./src/config/db');
const patientRoutes = require('./src/routes/patientRoutes');
const authRoutes = require('./src/routes/auth.routes');
const admissionRoutes = require('./src/routes/admission.routes');
const wardRoutes = require('./src/routes/ward.routes');
const transferRoutes = require('./src/routes/transfer.routes');
const testRegistrationRoutes = require('./src/routes/testRegistration.routes');
const labTestRoutes = require('./src/routes/labTest.routes');
const testResultRoutes = require('./src/routes/testResult.routes');
const healthRoutes = require('./src/routes/health.routes');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "HealthSlot API Documentation"
}));

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/lab', testRegistrationRoutes);
app.use('/api/lab', labTestRoutes);
app.use('/api/lab', testResultRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Don't start the server here
// Instead, export the app
module.exports = app; 