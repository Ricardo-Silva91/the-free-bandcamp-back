const fs = require('fs');
const path = require('path');
const { getRows, getDoc, getRowCount, getRowsToSave, saveRows, clearDaySheet } = require('../utils/google.utils');
const { getDetailsForAllAlbums } = require('../utils/browser.utils');

const saveAlbum = async (url) => {
  const doc = await getDoc();
  const { rows, rowsRaw } = await getRows(doc);

  const albumRow = rowsRaw.find((row) => row.link === url);

  if (albumRow) {
    albumRow.shouldSave = 'TRUE';
    await albumRow.save();
  }
};

const url = process.argv[2];

saveAlbum(url);

module.exports = {
  saveAlbum,
};
