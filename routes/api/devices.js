const express = require('express');
const devices = express.Router();

const Device = require('../../devices/device');

devices.get('/', (req, res) => {
	return res.json(Device.manager().list());
});

devices.post('/new', (req, res) => {
	let { deviceid: id, apikey: key } = req.body;
	if(!id || !key) {
		return res.status(400).json({
			error: {
				message: 'Id (deviceid) and key (apikey) required for new device',
				code:400
			}
		});
	}

	let device = new Device(id, key);
	Device.manager().save();

	return res.json({
		success: true,
		devices: Device.manager().list()
	});
});

devices.use('/:id', (req, res, next) => {
	let device = Device.manager().get(req.params.id);
	if(!device) {
		return res.status(400).json({
			error: {
				message: `Device ${req.params.id} not found`,
				code: 404
			}
		});
	}

	req.device = device;
	return next();
});

devices.post('/:id', (req, res) => {
	if(!req.body.state) {
		return res.status(400).json({
			error: {
				message: 'State is mandatory',
				code: 400
			}
		});
	}

	// on or off
	let state = req.body.state && (req.body.state === 1 || req.body.state === true)? 'on' : 'off';

	// set state to device
	req.device.turn(state);

	return res.json({
		success: true,
		state,
		device: req.device.toJSON()
	});
});

devices.post('/:id/on', (req, res) => {
	req.device.turn('on');

	return res.json({
		success: true,
		state: 'on',
		device: req.device.toJSON()
	});
});

devices.post('/:id/off', (req, res) => {
	req.device.turn('off');

	return res.json({
		success: true,
		state: 'off',
		device: req.device.toJSON()
	});
});

devices.post('/:id/toggle', (req, res) => {
	req.device.toggle();
	
	return res.json({
		success: true,
		state: req.device.state,
		device: req.device.toJSON()
	});
});

module.exports = devices;
