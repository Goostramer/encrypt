// In-memory storage for encrypted data and key pairs
const encryptedDataStore = [];
const keyPairStore = [];
let idCounter = 1;

// @desc    Save encrypted text
// @route   POST /api/encryption/data
exports.saveEncryptedText = (req, res) => {
  const { name, data } = req.body;
  const newData = {
    _id: (idCounter++).toString(),
    name,
    type: 'text',
    data,
    createdAt: new Date().toISOString()
  };
  encryptedDataStore.push(newData);
  res.status(201).json(newData);
};

// @desc    Save encrypted file
// @route   POST /api/encryption/file
exports.saveEncryptedFile = (req, res) => {
  const { name, data, metadata } = req.body;
  const newData = {
    _id: (idCounter++).toString(),
    name,
    type: 'file',
    data,
    metadata,
    createdAt: new Date().toISOString()
  };
  encryptedDataStore.push(newData);
  res.status(201).json(newData);
};

// @desc    Get all encrypted data
// @route   GET /api/encryption/data
exports.getEncryptedData = (req, res) => {
  const { type } = req.query;
  let result = encryptedDataStore;
  if (type) {
    result = result.filter(item => item.type === type);
  }
  res.json(result);
};

// @desc    Get encrypted data by ID
// @route   GET /api/encryption/data/:id
exports.getEncryptedDataById = (req, res) => {
  const item = encryptedDataStore.find(d => d._id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Encrypted data not found' });
  }
  res.json(item);
};

// @desc    Delete encrypted data
// @route   DELETE /api/encryption/data/:id
exports.deleteEncryptedData = (req, res) => {
  const index = encryptedDataStore.findIndex(d => d._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Encrypted data not found' });
  }
  encryptedDataStore.splice(index, 1);
  res.json({ message: 'Encrypted data removed' });
};

// @desc    Save key pair
// @route   POST /api/encryption/keys
exports.saveKeyPair = (req, res) => {
  const { name, publicKey, encryptedPrivateKey, keySize } = req.body;
  const newKeyPair = {
    _id: (idCounter++).toString(),
    name,
    publicKey,
    encryptedPrivateKey,
    keySize,
    createdAt: new Date().toISOString()
  };
  keyPairStore.push(newKeyPair);
  res.status(201).json(newKeyPair);
};

// @desc    Get all key pairs
// @route   GET /api/encryption/keys
exports.getKeyPairs = (req, res) => {
  res.json(keyPairStore);
};

// @desc    Get key pair by ID
// @route   GET /api/encryption/keys/:id
exports.getKeyPairById = (req, res) => {
  const keyPair = keyPairStore.find(k => k._id === req.params.id);
  if (!keyPair) {
    return res.status(404).json({ message: 'Key pair not found' });
  }
  res.json(keyPair);
};

// @desc    Delete key pair
// @route   DELETE /api/encryption/keys/:id
exports.deleteKeyPair = (req, res) => {
  const index = keyPairStore.findIndex(k => k._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Key pair not found' });
  }
  keyPairStore.splice(index, 1);
  res.json({ message: 'Key pair removed' });
};
