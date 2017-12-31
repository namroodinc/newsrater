export default function (data) {
  // Split the order
  const equality = [
    'Male',
    'Female'
  ];

  // Map the order, find match and sorting
  const equalityMap = equality.map(level => data.find(educationLevel => educationLevel.title === level));
  equalityMap.sort((a, b) => b.rating - a.rating);

  const firstRating = parseInt(equalityMap[0].rating);
  const lastRating = parseInt(equalityMap[equalityMap.length - 1].rating);
  const ratingTotal = firstRating + lastRating;

  return 100 - ((firstRating * 100 / ratingTotal) - (lastRating * 100 / ratingTotal)) * 2;
}
