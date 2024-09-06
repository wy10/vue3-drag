import { createApp } from "vue";
import App from "./App.vue";
import { TradeTable,TradeEchart } from "./bus";
import ElementPlus from 'element-plus'

import "element-plus/theme-chalk/index.css";

const app = createApp(App);



app.component('TradeTable',TradeTable)
app.component('TradeEchart',TradeEchart)


app.use(ElementPlus)

app.mount("#app");

