const axios = require('axios');
const cheerio = require('cheerio');
const { isTitleInDb, addAlbumsToDatabase } = require('./data.utils');
// const { readFile, writeFile } = require('./fs.utils.js');
// const { cleanUrl } = require('./js.utils.js');

const getDetailsForAlbum = (album) => new Promise(
  (resolve) => {
    const albumLink = album.url.startsWith('https:') || album.url.startsWith('http:') ? album.url : `https:${album.url}`;

    axios(albumLink)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);
        const tagsElems = $('.tralbum-tags .tag');
        const tags = [];

        tagsElems.each((_, tag) => {
          const title = $(tag).text();
          tags.push(title);
        });

        resolve({
          tags,
        });
      })
      .catch((error) => {
        console.log('axios error', { error });

        resolve(undefined);
      });
  },
);

const scrapeBandcamp = () => {
  axios('https://bandcamp.com/api/salesfeed/1/get_initial')
    .then(async (response) => {
      const html = response.data;

      const items = html.feed_data.events.filter((event) => event.items[0].item_price === 0);
      const freeItems = items.map((item) => item.items[0]);

      console.log({ freeItems: freeItems.length });

      const filteredFreeItems = freeItems.filter((item) => isTitleInDb(item.item_description));

      console.log({ filtered: filteredFreeItems.length });

      for (let i = 0; i < filteredFreeItems.length; i += 1) {
        const element = filteredFreeItems[i];
        const details = await getDetailsForAlbum(element);

        if (details) {
          filteredFreeItems[i] = {
            ...element,
            url: `https:${element.url}`,
            details,
          };
        }
      }

      console.log('got details');

      addAlbumsToDatabase(filteredFreeItems);

      console.log('albums logged to db');
    })
    .catch(console.error);
};

module.exports = {
  scrapeBandcamp,
  getDetailsForAlbum,
};
