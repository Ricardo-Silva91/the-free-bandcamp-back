const getRows = async (doc, slice = 0) => {
  const sheet = doc.sheetsByIndex[0];
  const { rowCount } = sheet;
  const sliceOffset = slice ? rowCount - slice : 0;
  const rowsRaw = await sheet.getRows({ offset: sliceOffset });
  const rowKeys = rowsRaw.length ? Object.keys(rowsRaw[0]).filter((key) => !key.includes('_')) : [];

  const rows = rowsRaw.map((row) => rowKeys.reduce(
    (acc, key) => ({ ...acc, [key]: row[key] }),
    {},
  ));

  return { rows, rowsRaw, sheet };
};

module.exports = {
  getRows,
};
