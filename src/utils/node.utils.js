const { exec } = require('node:child_process');

const updateBackendRemote = () => {
  const child = exec('npm run push');
  child.stdout.on('data', (data) => {
    console.log(`Powershell Data: ${data}`);
  });
  child.stderr.on('data', (data) => {
    console.log(`Powershell Errors: ${data}`);
  });
  child.on('exit', () => {
    console.log('Powershell Script finished');
  });
  child.stdin.end();
};

module.exports = {
  updateBackendRemote,
};
