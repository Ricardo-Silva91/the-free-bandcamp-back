/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
exports.handler = async () => {
  const macros = require('../../data/macros.json');

  if (!macros || !macros.latestDate) {
    return {
      statusCode: 404,
      body: 'Nothing found',
    };
  }

  try {
    const { latestDate, dayBefore } = macros;

    let result = require(`../../data/sale-date/${latestDate}.json`);
    const dayBeforeResult = require(`../../data/sale-date/${dayBefore}.json`);

    if (result.length < 100) {
      const placesLeft = 100 - result.length;
      const filteredDayBefore = dayBeforeResult.length > placesLeft
        ? dayBeforeResult.slice(dayBeforeResult.length - placesLeft) : dayBeforeResult;

      result = [...result, ...filteredDayBefore];
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.log('error fetching', { error });
    return {
      statusCode: 500,
      body: 'error fetching',
    };
  }
};
