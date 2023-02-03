const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const banish = require('to-zalgo/banish');
const { writeFile } = require('./fs.utils');

const dataPath = path.join(__dirname, '../../data');

const getDetailsForAlbum = (album) => new Promise(
  (resolve) => {
    const albumLink = album.url.startsWith('https:')
    || album.url.startsWith('http:') ? album.url : `https:${album.url}`;

    axios(albumLink)
      .then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        const artistElement = $('#name-section a');
        const artist = artistElement.text();
        const artistLink = artistElement.attr('href');

        const titleElement = $('#name-section .trackTitle');
        const title = titleElement.text().trim();

        const nyp = $('.buyItem.digital .buyItemNyp');
        const free = nyp.text() === 'name your price';

        const descriptionElement = $('.tralbumData.tralbum-about');
        const description = banish(descriptionElement.text()).trim().slice(0, 5000);

        const coverElement = $('.popupImage');
        const cover = coverElement.attr('href');

        const tracksElements = $('.title-col .track-title');
        const tracklist = [];

        tracksElements.each((track) => {
          const trackTitleElement = tracksElements.get(track);
          const trackTitle = $(trackTitleElement).text();

          tracklist.push(trackTitle);
        });

        const tagsElements = $('.tralbum-tags .tag');
        const tags = [];

        tagsElements.each((_, tag) => {
          const tagText = $(tag).text();
          tags.push(tagText);
        });

        const availableFormatsBlockElements = $('.buyItem ');
        let availableInVinyl = false;

        availableFormatsBlockElements.each((_, format) => {
          const formatBlockText = $(format).text();

          if (formatBlockText.includes('Buy Record/Vinyl')) {
            availableInVinyl = true;
          }
        });

        let releaseDate = '';

        try {
          const releaseDateElement = $('.tralbumData.tralbum-credits');
          const releaseDateInnerText = releaseDateElement.text();
          const releaseDateMatch = releaseDateInnerText.match(/release[d|s] [a-zA-Z]+ [0-9]{1,2}, [0-9]{4}/)[0];
          const releaseDateDate = new Date(releaseDateMatch.replace('released', ''));
          releaseDate = releaseDateDate.toISOString().split('T')[0].replace(/-/g, '/');
        } catch (dateError) {
          console.log({ dateError });
        }

        resolve({
          link: albumLink,
          title,
          artist,
          artistLink,
          free,
          description,
          cover,
          tracklist: JSON.stringify(tracklist),
          tags: JSON.stringify(tags),
          availableInVinyl,
          releaseDate,
          item_type: album.item_type,
          country_code: album.country_code,
        });
      })
      .catch((error) => {
        const html = error?.response?.data;

        if (html) {
          const $ = cheerio.load(html);

          const albumIsGoneElem = $('.content h2');
          const albumIsGone = albumIsGoneElem.text() === 'Sorry, that something isn’t here.';

          if (albumIsGone) {
            // console.log('album is gone', { albumLink });

            resolve({ error: true, code: 'album is gone', url: albumLink });
            return;
          }
        }

        // console.log('axios error', { code: error.code, albumLink });

        resolve({
          error: true, code: error.code, ...album, url: albumLink,
        });
      });
  },
);

const getDetailsForAllAlbums = async (albumList, rows, tries = 20) => {
  let promises = [];
  let allDone = false;
  let currentTries = 0;
  let finalResult = [];
  let currentAlbums = albumList.filter(
    (album, index) => albumList.findIndex(
      (cAlbum) => cAlbum.link === album.link,
    ) === index && album.item_type === 'a',
  );

  console.log('getDetailsForAllAlbums', { b: albumList.length, a: currentAlbums.length, r: rows.length });

  while (!allDone && currentTries < tries) {
    for (let i = 0; i < currentAlbums.length; i += 1) {
      const album = currentAlbums[i];
      const url = album.url.replace('https:https:', 'https:').replace('http:http:', 'http:');

      const albumIndex = rows.findIndex((row) => row.link === url);

      if (albumIndex === -1) {
        promises.push(getDetailsForAlbum({
          url,
          item_type: album.item_type,
          country_code: album.country_code,
        }));
      }
    }

    const currentResult = await Promise.all(promises);

    const good = currentResult.filter((row) => !row.error);
    const errors = currentResult.filter((row) => row.error && row.code !== 'album is gone');
    const goneAlbums = currentResult.filter((row) => row.error && row.code === 'album is gone');

    console.log({
      gl: good.length,
      el: errors.length,
      gaL: goneAlbums.length,
      currentTries,
      tries,
      fal: finalResult.length,
    });

    allDone = errors.length === 0;

    if (!allDone) {
      promises = [];
      currentTries += 1;

      currentAlbums = errors;
    }

    finalResult = [...finalResult, ...good];
  }

  return finalResult;
};

const scrapeBandcamp = async () => {
  axios('https://bandcamp.com/api/salesfeed/1/get_initial')
    .then(async (response) => {
      const html = response.data;

      const items = html.feed_data.events.filter((event) => event.items[0].item_price === 0);
      const freeItems = items.map((item) => ({ ...item.items[0], link: `https:${item.items[0].url}` }));

      console.log({ fil: freeItems.length });

      const files = fs.readdirSync(dataPath);
      let currentAlbums = [];

      if (files.length && files.includes('triage.json')) {
        currentAlbums = JSON.parse(fs.readFileSync(path.join(dataPath, 'triage.json')));
      }

      const newAlbums = freeItems.filter(
        (item) => currentAlbums.findIndex((album) => album.link === item.link) === -1,
      );

      console.log({ nal: newAlbums.length });

      if (newAlbums.length) {
        writeFile([...currentAlbums, ...newAlbums], path.join(dataPath, 'triage.json'));
      }
    })
    .catch(console.error);
};

module.exports = {
  scrapeBandcamp,
  getDetailsForAlbum,
  getDetailsForAllAlbums,
};
