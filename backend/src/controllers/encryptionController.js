const EncryptedData = require('../models/EncryptedData');
const KeyPair = require('../models/KeyPair');

// @desc    Save encrypted text
// @route   POST /api/encryption/data
// @access  Private
exports.saveEncryptedText = async (req, res) => {
  try {
    const { name, data } = req.body;
    
    const encryptedData = await EncryptedData.create({
      user: req.user.id,
      name,
      type: 'text',
      data
    });
    
    res.status(201).json(encryptedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save encrypted file
// @route   POST /api/encryption/file
// @access  Private
exports.saveEncryptedFile = async (req, res) => {
  try {
    const { name, data, metadata } = req.body;
    
    const encryptedData = await EncryptedData.create({
      user: req.user.id,
      name,
      type: 'file',
      data,
      metadata
    });
    
    res.status(201).json(encryptedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all encrypted data
// @route   GET /api/encryption/data
// @access  Private
exports.getEncryptedData = async (req, res) => {
  try {
    const { type } = req.query;
    
    const filter = { user: req.user.id };
    if (type) {
      filter.type = type;
    }
    
    const encryptedData = await EncryptedData.find(filter).sort({ createdAt: -1 });
    
    res.json(encryptedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get encrypted data by ID
// @route   GET /api/encryption/data/:id
// @access  Private
exports.getEncryptedDataById = async (req, res) => {
  try {
    const encryptedData = await EncryptedData.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!encryptedData) {
      return res.status(404).json({ message: 'Encrypted data not found' });
    }
    
    res.json(encryptedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete encrypted data
// @route   DELETE /api/encryption/data/:id
// @access  Private
exports.deleteEncryptedData = async (req, res) => {
  try {
    const encryptedData = await EncryptedData.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!encryptedData) {
      return res.status(404).json({ message: 'Encrypted data not found' });
    }
    
    await EncryptedData.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Encrypted data removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save key pair
// @route   POST /api/encryption/keys
// @access  Private
exports.saveKeyPair = async (req, res) => {
  try {
    const { name, publicKey, encryptedPrivateKey, keySize } = req.body;
    
    const keyPair = await KeyPair.create({
      user: req.user.id,
      name,
      publicKey,
      encryptedPrivateKey,
      keySize
    });
    
    res.status(201).json(keyPair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all key pairs
// @route   GET /api/encryption/keys
// @access  Private
exports.getKeyPairs = async (req, res) => {
  try {
    const keyPairs = await KeyPair.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.json(keyPairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get key pair by ID
// @route   GET /api/encryption/keys/:id
// @access  Private
exports.getKeyPairById = async (req, res) => {
  try {
    const keyPair = await KeyPair.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!keyPair) {
      return res.status(404).json({ message: 'Key pair not found' });
    }
    
    res.json(keyPair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete key pair
// @route   DELETE /api/encryption/keys/:id
// @access  Private
exports.deleteKeyPair = async (req, res) => {
  try {
    const keyPair = await KeyPair.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!keyPair) {
      return res.status(404).json({ message: 'Key pair not found' });
    }
    
    await KeyPair.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Key pair removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
