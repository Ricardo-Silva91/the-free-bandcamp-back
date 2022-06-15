export const cleanUrl = (url) => {
  let result = url;

  if (result.startsWith('http://')) {
    result = result.replace('http://', 'https://');
  }

  return result;
};

export const findDuplicates = (arr, keyToCheck = 'url') => {
  const valArr = [];
  const indexesToRemove = [];
  const duplicatesArray = arr.reduce((acc, el, index) => {
    let valueToCheck = el.data[keyToCheck];

    valueToCheck = cleanUrl(valueToCheck);

    if (valArr.includes(valueToCheck)) {
      indexesToRemove.push(index);
      return [...acc, el];
    }

    valArr.push(valueToCheck);

    return acc;
  }, []);

  return { duplicatesArray, indexesToRemove };
};

export const removeByIndexes = (arr, indexesToRemove) => {
  let result = [...arr];

  for (let i = indexesToRemove.length - 1; i >= 0; i -= 1) {
    result = [
      ...result.slice(0, indexesToRemove[i]),
      ...result.slice(indexesToRemove[i] + 1),
    ];
  }

  return result;
};

export default {};
