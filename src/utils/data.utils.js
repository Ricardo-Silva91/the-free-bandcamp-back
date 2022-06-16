/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const path = require('path');
const fs = require('fs');
const { updateBackendRemote } = require('./node.utils');

const dataPath = path.join(__dirname, '../../data/raw');
const macrosPath = path.join(__dirname, '../../data/macros.json');
const titlePath = path.join(dataPath, '../title');
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

const isTitleInTodaysSales = (title) => {
  if (!title) {
    return false;
  }

  try {
    const macros = JSON.parse(fs.readFileSync(macrosPath));
    const result = require(path.join(saleDatePath, `${macros.latestDate}.json`));

    const filtered = result.filter(
      (album) => album.item_description.toLocaleLowerCase() === title.toLocaleLowerCase(),
    );

    return filtered.length !== 0;
  } catch (error) {
    console.log('error on isTitleInTodaysSales', { error });
    return false;
  }
};

const addAlbumToSaleDateIndex = (album) => {
  const dateRaw = album.utc_date * 1000;
  const date = new Date(dateRaw).toISOString().split('T')[0];
  const target = path.join(saleDatePath, `${date}.json`);

  const dateFile = fs.existsSync(target);
  let content = [];

  if (dateFile) {
    content = JSON.parse(fs.readFileSync(target));
    content.push(album);
  } else {
    console.log('date file doesn\'t exist');

    const macros = JSON.parse(fs.readFileSync(macrosPath));
    const dayBefore = macros.latestDate;

    fs.writeFileSync(macrosPath, JSON.stringify({
      latestDate: date,
      dayBefore,
    }, null, 2));

    content = [album];
  }

  fs.writeFileSync(target, JSON.stringify(content, null, 2));
};

const addAlbumsToDatabase = (albums) => {
  albums.forEach((album) => {
    addAlbumToSaleDateIndex(album);
  });
};

const updateDataBase = async () => {
  await require('../scripts/setArtistIndex');
  await require('../scripts/setTitleIndex');

  await updateBackendRemote();
};

module.exports = {
  isTitleInDb,
  isTitleInTodaysSales,
  addAlbumsToDatabase,
  updateDataBase,
};
