/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
exports.handler = async (event) => {
  const { artist } = event.queryStringParameters;

  if (!artist) {
    return {
      statusCode: 400,
      body: 'No artist provided',
    };
  }

  try {
    let firstLetter = artist[0].toLocaleLowerCase();
    const alphabet = '#abcdefghijklmnopqrstuvwxyz';

    firstLetter = alphabet.includes(firstLetter) ? firstLetter : '#';

    const result = require(`../../data/artist/${firstLetter}.json`);
    const filtered = result.filter(
      (album) => album.artist_name.toLocaleLowerCase() === artist.toLocaleLowerCase(),
    );

    return {
      statusCode: 200,
      body: JSON.stringify(filtered),
    };
  } catch (error) {
    console.log('document doesn\'t exist!!', { error });
    return {
      statusCode: 400,
      body: 'No artist provided',
    };
  }
};
