const getSum = (total, num) => {
  return total + num;
}

export default function (data) {
  // Split the order
  const sfw = [
    'Work',
    'School',
    'Home'
  ];

  // Map the order and find match
  const sfwMap = sfw.map(level => data.find(sfwLevel => sfwLevel.title === level));

  // Return the ratings, total, percentage and weighting
  const sfwMapRatings = sfwMap.map(sfwMap => sfwMap.rating);
  const sfwMapRatingsTotal = sfwMapRatings.reduce(getSum);
  const sfwMapPercentage = sfwMap.map(sfwMap => (sfwMap.rating * 100 / sfwMapRatingsTotal));
  const sfwMapWeighting = sfwMapPercentage.map((sfwMap, i) => sfwMap / (i + 1));

  return sfwMapWeighting.reduce(getSum);
}
