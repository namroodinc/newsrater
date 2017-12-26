export default function (data) {
  // Split the order
  const equality = [
    'Male',
    'Female'
  ];

  // Map the order, find match and sorting
  const equalityMap = equality.map(level => data.find(educationLevel => educationLevel.title === level));
  equalityMap.sort((a, b) => b.rating - a.rating);

  return 100 - ((parseInt(equalityMap[0].rating) - parseInt(equalityMap[equalityMap.length - 1].rating)) * 2);
}
