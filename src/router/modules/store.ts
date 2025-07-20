const storeRoutes: RouteConfigsTable = {
  path: "/store",
  component: () => import("@/views/store/index.vue"),
  children: [],
};

export default storeRoutes;
