const fs = require('fs');
const path = require('path');
const { getRows, getDoc, getRowCount } = require('../utils/google.utils');
const { getDetailsForAllAlbums } = require('../utils/browser.utils');

const cleanDatabase = async () => {
  const doc = await getDoc();
  const rowCount = getRowCount(doc);
  
  console.log('cleaning', { rowCount });
};

cleanDatabase();

module.exports = {
  cleanDatabase,
};
