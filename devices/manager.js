const redfox = require('../global/redfox');
const fs = require('fs');

let Device = null;

class DeviceManager {
	constructor(){
		this.devices = [];
	}

	/**
	 * Add device to manager
	 */
	add(device) {
		let exists = this.devices.find(d => d.id === device.id);
		if(exists) {
			return redfox.error(`Device ${device.id} already exists, updating info`);
		}

		this.devices.push(device);
	}

	/**
	 * Remove device from existence
	 */
	remove(device) {
		let index = this.devices.findIndex(d => d.id === device.id);
		if(index > -1) {
			let [device] = this.devices.splice(index, 1);
			device.destroy();
		}
	}

	/**
	 * Get device from manager
	 */
	get(deviceId) {
		return this.devices.find(d => d.id === deviceId);
	}

	/**
	 * List of currently registered devices
	 */
	list() {
		return this.devices.map(d => d.toJSON());
	}

	/**
	 * Save device list
	 */
	save() {
		let devices = this.devices.map(d => d.toJSON());
		fs.writeFile('./devices.json', JSON.stringify(devices, null, 4), (err) => {
			if(err) {
				redfox.error('[MANAGER] Could not save device list', err);
			}
		});
	}

	/**
	 * Load devices from file
	 */
	load() {
		try {
			if(!Device) {
				Device = require('./device');
			}

			let devices = fs.readFileSync('./devices.json');
			devices = JSON.parse(devices);

			devices = devices.map(d => Device.fromJSON(d));
			this.devices = devices;
		} catch(err) {
			return redfox.error('[MANAGER] Could not load device list, file exists ?', err);
		}
	}
}

const manager = new DeviceManager();

module.exports = manager;
