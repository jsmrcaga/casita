const DeviceManager = require('./manager');
const redfox = require('../global/redfox');

class Device {
	constructor(id, key) {
		if(!id || !key) {
			throw new Error('Id and Key required for new Device');
		}

		this.id = id;
		this.key = key;
		this.name = '';
		this.socket = null;
		this.state = 'off';

		DeviceManager.add(this);
	}

	/**
	 * Check if websocket is there
	 * @param {string} str - Optional string to log
	 */
	__check(str) {
		if(!this.id || !this.key){
			redfox.error(`Device has no info`);
			throw new Error(`Cannot do anything with an unknown device`);
		}

		if(!this.socket) {
			redfox.error(`Device ${this.id} is disconnected, cannot send message`, str || '');
			throw new Error(`Cannot send message to a disconnected device`);
		}
	}

	/**
	 * Toggle device state by sending message
	 */
	__toggle() {
		this.send({
			action: 'update',
			params: {
				value: {
					switch: this.state
				}
			},
			deviceid: this.id,
			apikey: this.key
		});
	}

	/**
	 * Set websocket to device
	 */
	setSocket(ws) {
		this.socket = ws;
	}

	/**
	 * Set the name of the device
	 */
	setName(name) {
		this.name = name;
	}

	/**
	 * Retrieve device websocket
	 */
	ws() {
		return this.socket;
	}

	/**
	 * Send a message to the device
	 */
	send(message) {
		let str = JSON.stringify(message);
		this.__check(str);
		return this.socket.send(str);
	}

	/**
	 * Add event listener (proxied to websocket)
	 */
	on(event, callback) {
		return this.socket.on(event, callback.bind(this));
	}

	/**
	 * Turn the device on or off (device.turn('on'), device.turn('off'))
	 */
	turn(on = 'on') {
		this.__check();

		on = on === 'on' ? on : 'off';

		this.state = on;
		this.__toggle();
	}

	/**
	 * Toggle device state (blindly to actual state)
	 */
	toggle() {
		this.state = this.state === 'on' ? 'off' : 'on';
		this.__toggle();
	}

	/**
	 * Init websocket with callback
	 */
	init() {
		this.__check();
		this.on('message', message => {
			this.handleMessage(message);
		});
	}

	/**
	 * Handle incoming message, exposed for convenience
	 */
	handleMessage(message) {
		try {
			let data = JSON.parse(message);
			if(data.deviceid && !this.id) {
				this.id = data.deviceid;
			}

			if(data.apikey && !this.key) {
				this.key = data.apikey;
			}

			// HANDLING

			// Date
			if(data.date) {
				return redfox.log(`Device ${this.id} got date request`, message);
			}

			// Update
			if(data.update) {
				return redfox.log(`Device ${this.id} got update request`, message);
			}

			// Params
			if(data.params) {
				return redfox.log(`Device ${this.id} got params request`, message);
			}

			redfox.warn(`Device ${this.id} got unknown message`, message);

		} catch(e) {
			redfox.error('Device is not understandable, piece of shit', message);
			e.message = message;
			throw e;
		}
	}

	/**
	 * Destroy device
	 */
	destroy() {
		try {
			this.socket.close();
		} catch(e) {}
	}

	/**
	 * Serialize device to JSON
	 */
	toJSON() {
		return {
			id: this.id,
			key: this.key,
			name: this.name,
			state: this.state
		};
	}

	/**
	 * Instanciate from json
	 */
	static fromJSON(json) {
		let device = new Device(json.id, json.key);
		device.setName(json.name);
		device.state = json.state || 'off';
		return device;
	}

	/**
	 * Get the device manager
	 */
	static manager() {
		return DeviceManager;
	}
}

module.exports = Device;
