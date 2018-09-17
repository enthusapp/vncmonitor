!function() {
  let childErrorOnce = (child, cb) => {
    return () => {
      var once = false;

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
  };
}();