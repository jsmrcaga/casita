const express = require('express');
const redfox = require('../global/redfox');
const router = express.Router();
const Config = require('../global/config');

router.use('/', (req, res, next) => {
	redfox.warn('[HTTP] New request', `${req.ip} - ${req.method} ${req.path}`);
	return next();
});

// SOnOff main route motherfucker...
router.post('/dispatch/device', (req, res) => {
	redfox.info('[WEBSOCKET INFO] New request to server info', req.ip, JSON.stringify(req.headers));
	return res.json({
		error: 0,
		reason: 'ok',
		IP: Config.websocket.ip || '192.168.1.23',
		port: Config.websocket.port || 80
	});
});

router.use('/api', require('./api'));

module.exports = router;
