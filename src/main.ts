import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "@/style/reset.scss";
import "element-plus/dist/index.css";
import * as ElementPlusIcons from "@element-plus/icons-vue";
import "@/style/tailwind.css";
import "@/style/index.scss";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIcons)) {
  app.component(key, component);
}
app.mount("#app");
