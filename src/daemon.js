const nodeCron = require('node-cron');
const { sendAlbumsToDatabase } = require('./scripts/sendToDatabase');

const { scrapeBandcamp } = require('./utils/browser.utils');

console.log('setting up cron jobs');

nodeCron.schedule('0,30 * * * * *', () => {
  console.log('scraping');

  scrapeBandcamp();
});

nodeCron.schedule('0 30 * * * *', async () => {
  console.log('sending items to db');

  await sendAlbumsToDatabase();
});
