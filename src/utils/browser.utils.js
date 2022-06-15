const axios = require('axios');
const cheerio = require('cheerio');
// const { readFile, writeFile } = require('./fs.utils.js');
// const { cleanUrl } = require('./js.utils.js');

const getDetailsForAlbum = (album) => new Promise(
  (resolve) => {
    const albumLink = album.url.startsWith('https:') || album.url.startsWith('http:') ? album.url : `https:${album.url}`;

    axios(albumLink)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        const type = $('.buyItemPackageTitle.primaryText');
        const saleType = type.text() === 'Digital Album' ? 'album' : 'track';

        const tags = $('.tralbum-tags .tag');
        const stories = [];
        tags.each(() => {
          const title = $(this).text();
          stories.push(title);
        });

        resolve({
          type: saleType,
          stories,
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

      // let documents = readFile('./documents.json');

      const filteredFreeItems = freeItems;
      // const filteredFreeItems = freeItems.filter((item) => {
      //   const cleanedUrlBefore = cleanUrl(item.url);
      //   const cleanedUrl = cleanedUrlBefore.startsWith('https:') ||
      //  cleanedUrlBefore.startsWith('http:') ? cleanedUrlBefore : `https:${cleanedUrlBefore}`;

      //   const dataIndex = documents.findIndex((el) => cleanUrl(el.data.url) === cleanedUrl);

      //   return dataIndex === -1;
      // });

      console.log({ filtered: filteredFreeItems.length });

      for (let i = 0; i < filteredFreeItems.length; i += 1) {
        const element = filteredFreeItems[i];
        const details = {};// await getDetailsForAlbum(element);

        if (details) {
          filteredFreeItems[i] = {
            ...element,
            url: `https:${element.url}`,
            details,
          };
        }
      }

      console.log('got details');

      // for (let i = 0; i < filteredFreeItems.length; i += 1) {
      //   const album = filteredFreeItems[i];

      //   documents = await setScrapeByUrl(album.url, album, documents);
      // }

      console.log('albums logged to db');
      // writeFile(documents, './documents.json');
    })
    .catch(console.error);
};

module.exports = {
  scrapeBandcamp,
  getDetailsForAlbum,
};
