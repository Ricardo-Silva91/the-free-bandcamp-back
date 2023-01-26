/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { getVinylRows } = require('../utils/google.utils');

// require('dotenv').config();

const cred = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

exports.handler = async (event) => {
  const offset = parseInt(event.queryStringParameters.offset || 0, 10);
  const limit = parseInt(event.queryStringParameters.limit || 0, 10);
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth(cred);
  await doc.loadInfo();

  const {
    rows,
  } = await getVinylRows(doc, offset, limit);

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };
};
