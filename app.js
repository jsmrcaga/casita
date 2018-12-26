#!/usr/bin/env node
const redfox = require('./global/redfox');
const pkg = require('./package.json');
const websockets = require('./networking/wss');
const DeviceManager = require('./devices/manager');

if (process.argv && process.argv.indexOf('-v') > -1) {
	return redfox.success(`casita version ${pkg.version}`);
}

const { server, wss } = require('./server');

let port = process.env.PORT || 9876;

// Init websocket server
websockets(wss);

DeviceManager.load();
server.listen(port, (err) => {
	if(err) {
		redfox.error('[APP]', err);
		throw err;
	}

	redfox.success(`[APP] casita listening on port`, port);
});

process.on('uncaughtException', (err) => {
	redfox.uncaught('[Exception]', err);
	Sentry.captureException(err);
	process.exit(1);
});

process.on('unhandledRejection', (err) => {
	redfox.uncaught('[Promise Rejection]', err);
	Sentry.captureException(err);
	process.exit(1);
});

process.on('SIGINT', (event) => {
	redfox.log('[APP] Gracefully killing...');
	process.exit();
});
