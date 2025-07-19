import {
  createWebHashHistory,
  createWebHistory,
  RouterHistory,
} from "vue-router";

//配置默认为h5
function getHistoryMode(routerHistory): RouterHistory {
  // len为1 代表只有历史模式 为2 代表历史模式中存在base参数 https://next.router.vuejs.org/zh/api/#%E5%8F%82%E6%95%B0-1
  const historyMode = routerHistory.split(",");
  const leftMode = historyMode[0];
  let rightMode = historyMode[1];
  // no param
  if (historyMode.length === 1) {
    if (leftMode === "hash") {
      return createWebHashHistory("");
    }
    if (leftMode === "h5") {
      return createWebHistory("");
    }
  }
  if (historyMode.length === 2) {
    //has param
    if (leftMode === "hash") {
      return createWebHashHistory(rightMode);
    }
    if (leftMode === "h5") {
      return createWebHistory(rightMode);
    }
  }
}

export { getHistoryMode };
