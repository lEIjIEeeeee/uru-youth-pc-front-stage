import { defineStore } from "pinia";

export const pageCacheStore = defineStore("page-cache", {
  state: () => ({
    cachePageList: [],
  }),
  actions: {
    dynamicAddPersonalCachePage(name) {
      this.cachePageList = [name];
    },
    clearAllCachedPage() {
      this.cachePageList = [];
    },
  },
});

export function usePageCacheStore() {
  return pageCacheStore();
}
