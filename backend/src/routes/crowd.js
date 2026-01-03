const express = require('express');
const router = express.Router();
const { countCrowd, getHistory } = require('../controllers/crowdController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(protect);
router.use(apiLimiter);

router.post('/count', upload.single('image'), countCrowd);
router.get('/history', getHistory);

module.exports = router;
