const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.post('/register', customerController.register);

module.exports = router;

