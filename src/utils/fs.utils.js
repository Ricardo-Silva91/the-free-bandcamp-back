const fs = require('fs');
const path = require('path');

const writeFile = (data, pathToFile) => {
  fs.writeFileSync(path.join(pathToFile), JSON.stringify(data, null, 2));
};

const readFile = (pathToFile) => {
  const fileBuffer = fs.readFileSync(path.join(pathToFile));
  return JSON.parse(fileBuffer);
};

module.exports = {
  writeFile,
  readFile,
};
