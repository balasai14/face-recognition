const express = require('express');
const router = express.Router();
const { authenticateGroup, getAttendance, getAttendanceHistory } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(protect);
router.use(apiLimiter);

router.post('/authenticate', upload.single('image'), authenticateGroup);
router.get('/attendance/history', getAttendanceHistory);
router.get('/attendance/:eventId', getAttendance);

module.exports = router;
