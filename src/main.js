import { createApp } from "vue";
import storeInstance from "./store";
import "./style.scss";
import App from "./MainPage.vue";

createApp(App).use(storeInstance).mount("#app");
