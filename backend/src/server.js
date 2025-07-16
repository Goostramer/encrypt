require('dotenv').config();
const express = require('express');
const cors = require('cors');
const encryptionRoutes = require('./routes/encryption');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use encryption routes
app.use('/api/encryption', encryptionRoutes);

// Status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'running', mongoDBConnected: false, fallbackMode: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log('MongoDB connection status: Disconnected (no database)');
});
