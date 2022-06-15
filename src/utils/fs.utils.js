const fs = require('fs');
const path = require('path');

export const writeFile = (data, pathToFile) => {
  fs.writeFileSync(path.join(pathToFile), JSON.stringify(data, null, 2));
};

export const readFile = (pathToFile) => {
  const fileBuffer = fs.readFileSync(path.join(pathToFile));
  return JSON.parse(fileBuffer);
};

export default {};
