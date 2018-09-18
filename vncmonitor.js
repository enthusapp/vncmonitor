const _ = require('partial');
const hd = require('./lib/helper');

const config = {
  ip: '192.168.0.109',
  port: '5900',
  firstTime: 1,
  failWaitTime: -540,
  recoverTime: 60
};

let vnc = {
  count: 0,
  first: true,
  connected: false,
  process: null
};

const vncRun = () => {
  console.log('vncRun');
  vnc.process = hd.child('vncviewer', [config.ip], {
    stdout: () => {},
    stderr: () => {},
    close: () => {
      vnc.connected = false;
      vnc.process = null;
    },
  })();
};

const vncStop = () => {
  console.log('vncStop');
  if (vnc.process != null)
    vnc.process.kill();
};

const localRun = () => {console.log('localRun');};
const localStop = () => {console.log('localStop');};

setInterval(hd.childErrorOnce('nc', ['-vz', config.ip, config.port], data => {
  if (/succeeded/.test(`${data}`)) {
    vnc.count = vnc.count < 0 ? 0 : vnc.count + 1;
  } else {
    vnc.count = vnc.count > 0 ? -1 : vnc.count - 1;
  }
  console.log(vnc.count);
  if (vnc.first) {
      if (vnc.count > config.firstTime) {
        vnc.first = false;
        vnc.connected = true;
        vncRun();
      }
 } else {
    if (vnc.connected) {
    /* for test
      if (vnc.count > 100) {*/
      if (vnc.count < config.failWaitTime) {
        vncStop();
        localRun();
        vnc.count = 0;
      }
    } else {
      if (vnc.count > config.recoverTime) {
        vnc.connected = true;
        vncRun();
        localStop(); 
      }
    }
  }
}), 1000);