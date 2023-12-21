const express = require('express');
const googleController = require('../controllers/googleController');

const router = express.Router();

router.get('/schedule', googleController.getSchedule);
router.post('/book', googleController.book);
router.post('/contact-us', googleController.contactUs);

module.exports = router;
