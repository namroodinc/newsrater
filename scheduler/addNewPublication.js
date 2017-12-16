import getApi from "../utils/getApi";
import { appBaseUrl } from "../config";

const getList = getApi(`${appBaseUrl}/api/list/publications`);
getList.then((data) => {
  console.log(data);
});
