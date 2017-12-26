import { calcEducation } from "../../config";

const getSum = (total, num) => {
  return total + num;
}

export default function (data) {
  // Split the order
  const education = calcEducation.split(',');

  // Map the order and find match
  const educationMap = education.map(level => data.find(educationLevel => educationLevel.title === level));

  // Return the ratings, total, percentage and weighting
  const educationMapRatings = educationMap.map(educationMap => educationMap.rating);
  const educationMapRatingsTotal = educationMapRatings.reduce(getSum);
  const educationMapPercentage = educationMap.map(educationMap => (educationMap.rating * 100 / educationMapRatingsTotal));
  const educationMapWeighting = educationMapPercentage.map((educationMap, i) => educationMap / (i + 1));

  return educationMapWeighting.reduce(getSum);
}
