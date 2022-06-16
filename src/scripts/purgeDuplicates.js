const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/sale-date');

const dataFiles = fs.readdirSync(dataPath);
const numberedDataFiles = dataFiles.filter((file) => !fs.lstatSync(path.join(dataPath, file)).isDirectory() && !file.includes('_latest.'));

console.log({ dataFiles });

numberedDataFiles.reduce((acc, file) => {
  const data = JSON.parse(fs.readFileSync(path.join(dataPath, file)));

  let filteredData = data.filter((album) => !acc.find((accAlbum) => accAlbum.url === album.url));
  const foundUrls = [];

  filteredData = filteredData.reduce((acc2, album) => {
    if (foundUrls.includes(album.url)) {
      return acc2;
    }

    foundUrls.push(album.url);

    return [...acc2, album];
  }, []);

  console.log({ acc: acc.length, data: data.length, fil: filteredData.length });

  fs.writeFileSync(path.join(dataPath, file), JSON.stringify(filteredData, null, 2));

  return [...acc, ...data];
}, []);
