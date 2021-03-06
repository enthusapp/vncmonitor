!function() {
  const { spawn } = require('child_process');

  function child(command, option, cb) {
    return () => {
      var child = spawn(command, option);

      child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        cb.stdout(data);
      });

      child.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        cb.stderr(data);
      });

      child.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        cb.close(code);
      });

      return child;
    };
  }

  function childErrorOnce(command, option, cb) {
    return () => {
      var once = false;
      var child = spawn(command, option);

      child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });

      child.stderr.on('data', (data) => {
        if (once) {
          return;
        }
        once = true;
        cb(data);
      });

      child.on('close', (code) => {
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
    child: child,
  };
}();