const express = require('express');
const api = express.Router();

api.get('/', (req, res) => {
	// send version
});

api.use('/devices', require('./api/devices'));

// Error handling
api.use((err, req, res, next) => {
	if(!err) {
		return next();
	}

	let status = err.status || err.code || 500;

	return res.status(status).json({
		error: {
			message: err.message,
			code: status
		}
	});
});

module.exports = api;
