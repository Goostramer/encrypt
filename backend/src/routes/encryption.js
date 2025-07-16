const express = require('express');
const router = express.Router();
const {
  saveEncryptedText,
  saveEncryptedFile,
  getEncryptedData,
  getEncryptedDataById,
  deleteEncryptedData,
  saveKeyPair,
  getKeyPairs,
  getKeyPairById,
  deleteKeyPair
} = require('../controllers/encryptionController');

// Encrypted data routes
router.post('/data', saveEncryptedText);
router.post('/file', saveEncryptedFile);
router.get('/data', getEncryptedData);
router.get('/data/:id', getEncryptedDataById);
router.delete('/data/:id', deleteEncryptedData);

// Key pair routes
router.post('/keys', saveKeyPair);
router.get('/keys', getKeyPairs);
router.get('/keys/:id', getKeyPairById);
router.delete('/keys/:id', deleteKeyPair);

module.exports = router;
