const isEmpty = (data) => {
  return (Object.keys(data).length === 0);
}

const getSum = (total, num) => {
  return total + num;
}

const createArray = (pcc, ipso) => {
  const complaints = [];
  if (!isEmpty(pcc)) complaints.push(pcc.data);
  if (!isEmpty(ipso)) complaints.push(ipso.data);
  return complaints.length > 0 ? complaints : null;
}

export default function (pcc, ipso, complaintsAvg) {
  const array = createArray(pcc, ipso);

  if (array === null) return complaintsAvg;

  const upheld = array.map(data =>data['Upheld']).reduce(getSum);
  const resolved = array.map(data =>data['Resolved']).reduce(getSum);
  const total = array.map(data =>data['Total']).reduce(getSum);

  const weighting = (total * 100 / 1000);
  const score = (upheld + resolved) * 100 / total;

  return 100 - (weighting / score * 100);
}
