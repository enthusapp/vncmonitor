!function() {
  const { spawn } = require('child_process');
  let childErrorOnce = (child, cb) => {
    return () => {
      var once = false;
      const cmd = spawn(child.command, child.option);

      cmd.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      cmd.stderr.on('data', (data) => {
        if (once) {
          return;
        }
        once = true;
        cb(data);
      });

      cmd.on('close', (code) => {
        if (once) {
          return;
        }
        once = true;
        console.log(`child process exited with code ${code}`);
        cb(code, -1);
      });
    };
  }
  module.exports = {
    childErrorOnce: childErrorOnce,
  };
}();