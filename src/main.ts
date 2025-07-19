import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "@/style/reset.scss";
import "element-plus/dist/index.css";
import "@/style/tailwind.css";

import "@/style/index.scss";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.mount("#app");
