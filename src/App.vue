<template>
  <div class="app" @click="clearAll">
    <div>
      <Left @start="startDrag" @end="endDrag" />
    </div>
    <div style="position: relative">
      <Middle v-model="jsonData" id="middle" @blockMousedown="blockMousedown" />
    </div>
    <div>right</div>
  </div>
</template>
<script setup>
import { nextTick, onMounted, provide, ref } from "vue";
import { focusBlocks } from "./hooks/useHooks";
import Left from "./components/left.vue";
import Middle from "./components/middle.vue";
import jsonFile from "./data.json";

let middleDom = null;


const comps = ref({
  "el-button": {
    title: "按钮",
    compName: "el-button",
  },
  text: {
    title: "输入框",
    compName: "el-input",
  },
});

const jsonData = ref(JSON.parse(JSON.stringify(jsonFile)));
const currMoveBlock = ref(null);

const startDrag = (item) => {
  currMoveBlock.value = item;
};
const endDrag = () => {
  currMoveBlock.value = null;
};

const clearAll = ()=>{
  jsonData.value.blocks.forEach((item) => {
    item.focus = false;
  });
  focusBlocks.value = []
}



provide("comps", comps);
provide("jsonData", jsonData);

onMounted(() => {
  middleDom = document.getElementById("middle");
  middleDom.addEventListener("dragenter", (e) => {
    e.dataTransfer.dropEffect = "move";
  });
  middleDom.addEventListener("dragover", (e) => {

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  middleDom.addEventListener("dragleave", (e) => {
    e.dataTransfer.dropEffect = "none";
  });
  middleDom.addEventListener("drop", (e) => {
    console.log(e);
    // 改变jsonData对象
    if (currMoveBlock.value) {
      jsonData.value.blocks.push({
        top: e.offsetY,
        left: e.offsetX,
        zIndex: 1,
        compName: currMoveBlock.value.compName,
        alignCenter: true,
      });
    }
  });
});
</script>

<style lang="less" scoped>
.app {
  display: flex;
  & > div:first-child {
    width: 300px;
  }
  & > div:nth-child(2) {
    flex: 1;
    margin: 10px;
  }
  & > div:last-child {
    width: 300px;
    background: red;
  }
}
</style>


