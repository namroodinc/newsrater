import sentiment from "sentiment";
import sentimentAlignment from "../sentiment/alignment";

export default function (alignments, format) {
  const alignmentsAndFormat = [
    ...alignments,
    ...format
  ];
  let totalScore = 0;

  alignmentsAndFormat.map(data => {
    const string = data.replace(/\(.*?\)/g, '').trim();
    const { score } = sentiment(string, sentimentAlignment);
    totalScore += score;
  });

  return totalScore;
}
