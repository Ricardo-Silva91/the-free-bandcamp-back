const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/raw');
const titlePath = path.join(dataPath, '../title');

const dataFiles = fs.readdirSync(dataPath);
const numberedDataFiles = dataFiles.filter((file) => !fs.lstatSync(path.join(dataPath, file)).isDirectory() && !file.includes('_latest.'));

const content = numberedDataFiles.reduce((acc, file) => {
  const fileContent = JSON.parse(fs.readFileSync(path.join(dataPath, file)));
  const { data } = fileContent;

  return [...acc, ...data];
}, []);

console.log({ dl: dataFiles.length, n: numberedDataFiles.length, cl: content.length });

const alphabet = '#abcdefghijklmnopqrstuvwxyz';
const alphabetObject = {};

for (let i = 0; i < alphabet.length; i += 1) {
  const letter = alphabet[i];

  alphabetObject[letter] = [];
}

// eslint-disable-next-line no-restricted-syntax
for (const album of content) {
  const firstLetter = album.item_description.toLocaleLowerCase()[0];

  if (alphabetObject[firstLetter]) {
    alphabetObject[firstLetter].push(album);
  } else {
    alphabetObject['#'].push(album);
  }
}

// eslint-disable-next-line no-restricted-syntax
for (const letter of Object.keys(alphabetObject)) {
  const target = path.join(titlePath, `${letter}.json`);
  const toWrite = alphabetObject[letter].sort((a, b) => (a.item_description.replace(/ /, '') > b.item_description.replace(/ /, '') ? 1 : -1));

  fs.writeFileSync(target, JSON.stringify(toWrite, null, 2));
}
