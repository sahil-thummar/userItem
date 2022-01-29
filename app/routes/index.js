const express = require("express");
const router = express.Router();

router.use('/item', require('./item'));
router.use('/user', require('./user'));

module.exports = router;