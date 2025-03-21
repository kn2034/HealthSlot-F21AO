const responseTime = require('response-time');
const client = require('prom-client');

// Create a Registry to register metrics
const register = new client.Registry();

// Create metrics
const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5]
});

const httpRequestTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);

// Middleware function
const metricsMiddleware = responseTime((req, res, time) => {
    if (req.url !== '/metrics') {
        httpRequestDuration
            .labels(req.method, req.url, res.statusCode)
            .observe(time / 1000);
        
        httpRequestTotal
            .labels(req.method, req.url, res.statusCode)
            .inc();
    }
});

// Metrics endpoint
const getMetrics = async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
};

module.exports = {
    metricsMiddleware,
    getMetrics
}; 