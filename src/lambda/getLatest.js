/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { getRows } = require('../utils/google.utils');

require('dotenv').config();

const cred = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
};

exports.handler = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth(cred);
  await doc.loadInfo();

  const {
    rows,
  } = await getRows(doc, 200);

  return {
    statusCode: 200,
    body: JSON.stringify(rows),
  };
};
