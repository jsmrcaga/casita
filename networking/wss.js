const redfox = require('../global/redfox');
const Device = require('../devices/device');

module.exports = function(wss) {
	wss.on('connection', ws => {
		redfox.info('[WSS] New connection!');
		// wait for connection
		let firstHandling =  message => {
			redfox.info('[WSS] MESSAGE', message);
			try {
				let data = JSON.parse(message);

				if(!data.deviceid) {
					throw new Error('WebSocket does not contain device id');
				}
			} catch(e) {
				redfox.error('[WSS] WebSocket sent unknown message', message);
				e.message = message;
				throw e;
			}

			let device = Device.manager().get(message.deviceid);

			if(!device) {
				// WHAT THE FUCK
				ws.send(JSON.stringify({ lol: 'not today' }));
				ws.close();
				throw new Error('Unknown device trying to get access');
			}

			if(!device.ws()) {
				// pass socket info to device
				device.setSocket(ws);
				device.init();

				// let device handle this message
				device.handleMessage(message);

				// remove this listener from ws
				ws.off(firstHandling);
			}
			// else, device already is inited and can handle his own message
		};

		ws.on('message', firstHandling);
	});
};
