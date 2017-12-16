import getApi from "../utils/getApi";

const getList = getApi('/api/list/publications');
getList.then((data) => {
  console.log(data);
});
