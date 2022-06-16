const nodeCron = require('node-cron');

const { scrapeBandcamp } = require('./utils/browser.utils');
const { updateDataBase } = require('./utils/data.utils');

console.log('setting up cron jobs');

nodeCron.schedule('0,30 * * * * *', () => {
  console.log('scraping');

  scrapeBandcamp();
});

nodeCron.schedule('0 0 0 * * *', async () => {
  console.log('refreshing local db');

  await updateDataBase();
});
