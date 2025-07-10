require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const encryptionRoutes = require('./routes/encryption');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/encryption-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.warn('Running in fallback mode: data will not be persisted');
    // Instead of exiting, we'll continue without MongoDB
    return false;
  }
};

// Start server after connecting to MongoDB
connectDB().then((isConnected) => {
  // Add middleware to handle MongoDB fallback mode
  if (!isConnected) {
    // Set up fallback routes first
    app.get('/api/status', (req, res) => {
      res.status(200).json({ status: 'running', mongoDBConnected: false, fallbackMode: true });
    });
    
    // Generic fallback handlers for auth and encryption routes
    app.use('/api/auth', (req, res) => {
      res.status(200).json({ message: 'Auth service available in fallback mode', fallbackMode: true });
    });
    
    app.use('/api/encryption', (req, res) => {
      res.status(200).json({ message: 'Encryption service available in fallback mode', fallbackMode: true });
    });
  } else {
    // MongoDB is connected, use the actual routes
    app.use('/api/auth', authRoutes);
    app.use('/api/encryption', encryptionRoutes);
    
    // Add a status endpoint
    app.get('/api/status', (req, res) => {
      res.status(200).json({ status: 'running', mongoDBConnected: true });
    });
  }
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`MongoDB connection status: ${isConnected ? 'Connected' : 'Disconnected (fallback mode)'}`);
  });
});
