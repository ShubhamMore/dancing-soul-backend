const sortArrayOfObjects = async (array, element) => {
  const sortedArray = array.sort((a, b) => {
    let data1 = a[element].toString().toLowerCase();
    let data2 = b[element].toString().toLowerCase();
    if (data1 > data2)
      //sort string ascending
      return -1;
    if (data1 < data2) return 1;
    return 0;
  });

  return sortedArray;
};

module.exports = sortArrayOfObjects;
