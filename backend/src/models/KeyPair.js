const mongoose = require('mongoose');

const KeyPairSchema = new mongoose.Schema({
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
  publicKey: {
    type: String,
    required: true
  },
  encryptedPrivateKey: {
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
  keySize: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('KeyPair', KeyPairSchema);
