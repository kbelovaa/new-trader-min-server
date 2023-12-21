const express = require('express');

const router = express.Router();
const googleRouter = require('./googleRouter');

router.use('/google', googleRouter);

module.exports = router;
