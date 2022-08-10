<template>
  <div class="app">
    <Editor v-model="state"></Editor>
  </div>
</template>

<script>
import data from "./data.json";
import { ref } from "@vue/reactivity";
import Editor from "./packages/editor";
import { registerConfig } from "./utils/editor-config";
import { provide } from "vue";
export default {
  components: {
    Editor,
  },
  setup() {
    const state = ref(data);
    provide("config", registerConfig); //将组件配置直接提供给子后代使用
    return {
      state,
    };
  },
};
</script>

<style>
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  left: 20px;
  height: 100%;
}
</style>
