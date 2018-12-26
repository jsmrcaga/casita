const express = require('express');
const router = express.Router();
const Config = require('../global/config');

// SOnOff main route motherfucker...
router.get('/', (req, res) => {
	return res.json({
		error: 0,
		reason: 'ok',
		IP: Config.websocket.ip || '192.168.1.23',
		port: Config.websocket.port || 80
	});
});

router.use('/api', require('./api'));

module.exports = router;
