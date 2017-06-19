const { spawn } = require('child_process');
const path = require('path');

function svnUpdate(dir='../ft-interact') {
  const cwd = path.resolve(process.cwd(), dir);

  console.log(`Updating ${cwd}`);
  return new Promise((resolve, reject) => {
    const svn = spawn('svn', ['update'], {
      cwd
    });

    svn.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    svn.stderr.on('data', (data) => {
      console.log(data);
    });

    svn.on('close', (code) => {
      console.log(`exited with ${code}`);
      resolve();
    });

    svn.on('error', (err) => {
      console.log(err);
      reject(err);
    });
  });
}

if (require.main === module) {
  svnUpdate()
    .catch(err => {
      console.log(err);
    });
}

module.exports = svnUpdate