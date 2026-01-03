const express = require('express');
const router = express.Router();
const { register, authenticate, getProfile, deleteProfile } = require('../controllers/individualController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(protect);
router.use(apiLimiter);

router.post('/register', upload.array('images', 10), register);
router.post('/authenticate', upload.single('image'), authenticate);
router.get('/:userId', getProfile);
router.delete('/:userId', authorize('admin'), deleteProfile);

module.exports = router;
