import { createApp } from "vue";
import App from "./App.vue";
import "element-plus/theme-chalk/index.css";

// createApp创建得是应用实例.mount后返回得是根组件实例
// 一个根组件可以包含n个子组件，每个组件将有自己的组件实例，这些组件实例都共享同一个应用实例
const app = createApp(App);
// app.config.globalProperties.shareName = "h";
// const internalInstance = getCurrentInstance();
// console.log(internalInstance.appContext.config.globalProperties.shareName);
app.mount("#app");
// 构造假数据，实现渲染
// 配置组件得映射关系 { preview:xxx, render:xxx }
