const homeRoutes: RouteConfigsTable = {
  path: "/",
  name: "HomeRoot",
  redirect: "/home",
  children: [
    {
      path: "/home",
      name: "Home",
      meta: {
        title: "首页",
      },
      component: () => import("@/views/home/index.vue"),
    },
  ],
};

export default homeRoutes;
