import nProgress from "nprogress";
import { createRouter, Router } from "vue-router";
import publicRoutes from "./modules/public";
import { getHistoryMode } from "./utils";
import { usePageCacheStore } from "@/store/page-cache";
import setTitle from "@/util/setTitle";
import { getToken } from "@/util/auth";

/**
 * 自动导入静态路由，匹配路径：src/router/modules
 * eager: true时立即加载，false时按需加载
 */
const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "./modules/**/public.ts"],
  {
    eager: true,
  }
);

/** 静态路由集合 */
const routes: any[] = [];

Object.keys(modules).forEach((key) => {
  routes.push(modules[key].default);
});

/** 创建路实例 */
export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: routes.concat(...(publicRoutes as any)),
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number =
            document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  },
});

router.beforeEach((to: ToRouteType, _from: ToRouteType, next) => {
  if (to.name && Array.isArray(to.meta?.toCachePages)) {
    usePageCacheStore().dynamicAddPersonalCachePage(to.name);
  } else if (
    _from.name &&
    Array.isArray(_from.meta?.toCachePages) &&
    _from.meta?.toCachePages.includes(to.name)
  ) {
    usePageCacheStore().dynamicAddPersonalCachePage(_from.name);
  } else {
    usePageCacheStore().clearAllCachedPage();
  }
  setTitle(to.meta.title);
  const isLogin = !!getToken();
  nProgress.start();
  if (isLogin || to.name === "Login") {
    next();
  } else {
    const query = to.fullPath === "/" ? {} : { redirect: to.fullPath };
    next({
      name: "Login",
      query,
    });
  }
});

router.afterEach(() => {
  nProgress.done();
});

export default router;
