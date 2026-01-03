const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { initGridFS } = require('./utils/gridfs');
const swaggerSpec = require('./config/swagger');

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB().then(() => {
  initGridFS();
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/individual', require('./routes/individual'));
app.use('/api/group', require('./routes/group'));
app.use('/api/crowd', require('./routes/crowd'));
app.use('/api/keys', require('./routes/apiKeys'));
app.use('/api/monitoring', require('./routes/monitoring'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api/docs`);
});

module.exports = app;
// restart trigger 3
