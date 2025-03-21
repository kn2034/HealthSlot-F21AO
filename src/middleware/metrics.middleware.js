const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;

// Create metrics
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.5, 1, 5]
});

const totalRequests = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'code']
});

// Initialize default metrics
collectDefaultMetrics();

// Middleware function
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        httpRequestDurationMicroseconds
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration / 1000);
        
        totalRequests
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .inc();
    });

    next();
};

// Metrics endpoint handler
const getMetrics = async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
};

// Health check endpoint handler
const healthCheck = (req, res) => {
    res.status(200).json({ status: 'UP' });
};

module.exports = { metricsMiddleware, getMetrics, healthCheck }; 