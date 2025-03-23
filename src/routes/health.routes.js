const express = require('express');
const router = express.Router();
const { version } = require('../../package.json');

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version
  });
});

module.exports = router; 