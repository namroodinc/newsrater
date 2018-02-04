export default function (alexa, maxRank) {
  const latestAlexa = alexa[alexa.length - 1].data.globalRank;
  return 100 - (latestAlexa * 100 / maxRank);
}
