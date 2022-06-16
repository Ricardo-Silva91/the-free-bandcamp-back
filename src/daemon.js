// const nodeCron = require('node-cron');

// const { scrapeBandcamp } = require('./utils/browser.utils');
const { updateDataBase } = require('./utils/data.utils');

// nodeCron.schedule('0 * * * * *', () => {
//   console.log('refreshing local db');

//   scrapeBandcamp();
// });

// nodeCron.schedule('0 0 0 * * *', async () => {
//   console.log('refreshing local db');

//   await updateDataBase();
// });

// scrapeBandcamp();

updateDataBase();
