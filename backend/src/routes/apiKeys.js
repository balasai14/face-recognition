const express = require('express');
const router = express.Router();
const { generateKey, listKeys, revokeKey } = require('../controllers/apiKeyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateKey);
router.get('/', listKeys);
router.delete('/:keyId', revokeKey);

module.exports = router;
