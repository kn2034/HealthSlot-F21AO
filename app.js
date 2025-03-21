const express = require('express');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
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

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(metricsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Metrics endpoint
app.get('/metrics', getMetrics);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Don't start the server here
// Instead, export the app
module.exports = app; 