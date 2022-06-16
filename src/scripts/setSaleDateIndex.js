const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/raw');
const saleDatePath = path.join(dataPath, '../sale-date');

const dataFiles = fs.readdirSync(dataPath);
const numberedDataFiles = dataFiles.filter((file) => !fs.lstatSync(path.join(dataPath, file)).isDirectory() && !file.includes('_latest.'));

const content = numberedDataFiles.reduce((acc, file) => {
  const fileContent = JSON.parse(fs.readFileSync(path.join(dataPath, file)));
  const { data } = fileContent;

  return [...acc, ...data];
}, []);

console.log({ dl: dataFiles.length, n: numberedDataFiles.length, cl: content.length });

const alphabetObject = {};

// eslint-disable-next-line no-restricted-syntax
for (const album of content) {
  const dateRaw = album.utc_date * 1000;
  const date = new Date(dateRaw).toISOString().split('T')[0];

  if (alphabetObject[date]) {
    alphabetObject[date].push(album);
  } else {
    alphabetObject[date] = [album];
  }
}

// eslint-disable-next-line no-restricted-syntax
for (const letter of Object.keys(alphabetObject)) {
  const target = path.join(saleDatePath, `${letter}.json`);
  const toWrite = alphabetObject[letter].sort((a, b) => (a.utc_date > b.utc_date ? 1 : -1));

  fs.writeFileSync(target, JSON.stringify(toWrite, null, 2));
}