export const publicRoutes: RouteConfigsTable[] = [
  {
    path: "/login",
    name: "Login",
    meta: {
      title: "登录",
    },
    component: () => import("@/views/login/index.vue"),
  },
];

export default publicRoutes;
