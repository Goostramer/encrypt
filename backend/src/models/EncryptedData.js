const mongoose = require('mongoose');

const EncryptedDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'file', 'rsa'],
    required: true
  },
  data: {
    ciphertext: {
      type: String,
      required: true
    },
    iv: {
      type: String,
      required: true
    },
    salt: {
      type: String
    },
    algorithm: {
      type: String,
      required: true
    }
  },
  metadata: {
    originalFileName: {
      type: String
    },
    fileSize: {
      type: Number
    },
    mimeType: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EncryptedData', EncryptedDataSchema);
