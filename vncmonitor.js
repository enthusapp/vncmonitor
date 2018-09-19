const _ = require('partial');
const hd = require('./lib/helper');

const config = {
  ip: '192.168.0.109',
  port: '5900',
  process2: {
    command: 'python',
    option: ['/home/pi/Videos/mf_rtp.py']},
  firstTime: 1,
  failWaitTime: -540,
  recoverTime: 10
};

let vnc = {
  count: 0,
  first: true,
  connected: false,
  process1: null,
  process2: null
};

function vncRun() {
  console.log('vncRun');
  vnc.connected = true;
  vnc.process1 = hd.child('vncviewer', [config.ip], {
    stdout: () => {},
    stderr: () => {},
    close: () => {
      vnc.connected = false;
      vnc.process1 = null;
    },
  })();
};

function vncStop() {
  console.log('vncStop');
  if (vnc.process1 != null)
    vnc.process1.kill();
};

function localRun() {
  console.log('localRun');
  vnc.process2 = hd.child(config.process2.command, config.process2.option, {
    stdout: () => {},
    stderr: () => {},
    close: () => {
      console.log('local Closed');
      vnc.process2 = null;
    },
  })();
};

function localStop() {
  console.log('localStop');
  if (vnc.process2 != null)
    vnc.process2.kill();
};

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
        vncRun();
      }
 } else {
    if (vnc.connected) {
      /* for test
      if (vnc.count > 50) {
        vnc.count = 0;
        */
      if (vnc.count < config.failWaitTime) {
        vncStop();
        localRun();
      }
    } else {
      if (vnc.count > config.recoverTime) {
        vncRun();
        localStop(); 
      }
    }
  }
}), 1000);