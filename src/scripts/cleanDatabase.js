const fs = require('fs');
const path = require('path');
const { getRows, getDoc } = require('../utils/google.utils');
const { getDetailsForAllAlbums } = require('../utils/browser.utils');

const cleanDatabase = async () => {
  const doc = await getDoc();
  
  console.log('cleaning');
};

cleanDatabase();

module.exports = {
  cleanDatabase,
};
