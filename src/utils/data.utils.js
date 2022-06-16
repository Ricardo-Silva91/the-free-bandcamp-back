/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const path = require('path');
const fs = require('fs');

const dataPath = path.join(__dirname, '../../data/raw');
const titlePath = path.join(dataPath, '../title');
const artistPath = path.join(dataPath, '../artist');
const saleDatePath = path.join(dataPath, '../sale-date');

const isTitleInDb = (title) => {
  if (!title) {
    return false;
  }

  try {
    let firstLetter = title[0].toLocaleLowerCase();
    const alphabet = '#abcdefghijklmnopqrstuvwxyz';

    firstLetter = alphabet.includes(firstLetter) ? firstLetter : '#';

    const result = require(path.join(titlePath, `${firstLetter}.json`));
    const filtered = result.filter(
      (album) => album.item_description.toLocaleLowerCase() === title.toLocaleLowerCase(),
    );

    return filtered.length !== 0;
  } catch (error) {
    console.log('error on isTitleInDb', { error });
    return false;
  }
};

const addAlbumToSaleDateIndex = (album) => {
  const dateRaw = album.utc_date * 1000;
  const date = new Date(dateRaw).toLocaleDateString().replace(/\//g, '-');
  const target = path.join(saleDatePath, `${date}.json`);

  const dateFile = fs.existsSync(target);
  let content = [];

  if (dateFile) {
    console.log('date file exists');

    content = JSON.parse(fs.readFileSync(target));
    content.push(album);
  } else {
    console.log('date file doesn\'t exist');

    content = [album];
  }

  fs.writeFileSync(target, content);
};

const addAlbumsToDatabase = (albums) => {
  albums.forEach((album) => {
    addAlbumToSaleDateIndex(album);
  });
};

module.exports = {
  isTitleInDb,
  addAlbumsToDatabase,
};
