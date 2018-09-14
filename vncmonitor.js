const { spawn } = require('child_process');
const config = {
	ip: '192.168.0.109',
	port: '5900',
	firstTime: 10,
	failWaitTime: 540,
	recoverTime: 60
};

var vnc = {
	var count = 0;
	var first = true;
	var connected = false;
};

function ncCheck(cb) {
	return () => {
		var seq = 0;
		const nc = spawn('nc', ['-vz', config.ip, config.port]);

		nc.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		nc.stderr.on('data', (data) => {
			if (seq) {
				return;
			}
			seq++;
			cb(`${data}`.search('succeeded') > 0 ? 1 : -1, data);
		});

		nc.on('close', (code) => {
			if (seq) {
				return;
			}
			seq++;
			console.log(`child process exited with code ${code}`);
			cb(-1, code);
		});
	};
};

setInterval(ncCheck(r => {
	if (r > 0) {
		vnc.count = vnc.count < 0 ? 0 : vnc.count + 1;
	} else {
		vnc.count = vnc.count > 0 ? -1 : vnc.count - 1;
	}
	console.log(vnc.count);
	if (vnc.first) {
		if (vnc.count > config.firstTime) {
			vnc.first = false;
			vnc.vnc = spawn('vncviewer', [config.ip]);
			vnc.conneted = true;
			vnc.count = 0;

			vnc.vnc.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`);
			});

			vnc.vnc.stderr.on('data', (data) => {
				console.log(`stderr: ${data}`);
			});

			vnc.vnc.on('close', (code) => {
				vnc.conneted = false;
				console.log(`child process exited with code ${code}`);
			});
		}
	} else if (vnc.count > config.recoverTime && !vnc.connected){
		vnc.vnc = spawn('vncviewer', [config.ip]);
		vnc.conneted = true;
		vnc.count = 0;

		vnc.vnc.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		vnc.vnc.stderr.on('data', (data) => {
			console.log(`stderr: ${data}`);
		});

		vnc.vnc.on('close', (code) => {
			vnc.conneted = false;
			console.log(`child process exited with code ${code}`);
		});
	}
}), 1000);
