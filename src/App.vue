<template>
  <div class="app" @click="clearAll">
    <div>
      <Left @start="startDrag" @end="endDrag" />
    </div>
    <div style="position: relative">
      <Middle v-model="jsonData" id="middle" />
      <div :style="{ ...divider, 'z-index':100,border:'2px dotted red' }" v-show="dividerShow"></div>
    </div>
    <div>right</div>
  </div>
</template>
<script setup>
import { computed, nextTick, onMounted, provide, ref } from "vue";
import { focusBlocks } from "./hooks/useHooks";
import Left from "./components/left.vue";
import Middle from "./components/middle.vue";
import jsonFile from "./data.json";

let middleDom = null;

const comps = ref({
  "trade-table": {
    title: "表格",
    compName: "trade-table",
    preview: () => {
      return "表格";
    },
  },
   "trade-echart": {
    title: "图表",
    compName: "trade-echart",
    preview: () => {
      return "图表";
    },
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

const clearAll = () => {
  jsonData.value.blocks.forEach((item) => {
    item.focus = false;
  });
  focusBlocks.value = [];
};

const divider = ref({})
const dividerShow = ref(false)

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
    dividerShow.value = true
    const blocks = jsonData.value.blocks;
    let block = null;
    let start = {};
    let end = {};
    if (currMoveBlock.value) {
      for (let i = 0; i < blocks.length; i++) {
        // 1. 当前鼠标的范围处于什么组件
        start = { x: blocks[i].left, y: blocks[i].top };
        end = {
          x: blocks[i].left + blocks[i].width,
          y: blocks[i].top + blocks[i].height,
        };
        if (
          e.offsetX >= start.x &&
          e.offsetX <= end.x &&
          e.offsetY >= start.y &&
          e.offsetY <= end.y
        ) {
          block = blocks[i];
          break;
        }
      }
      // 将图形对角线划分
      let x = block.width / 2;
      let y = block.height / 2;
      let endY = 0;
      if (e.offsetX < x) {
        endY = parseInt((e.offsetX * y) / x);
      } else {
        endY = parseInt(((x - (e.offsetX - x)) * y) / x);
      }

      if (
        e.offsetX < start.x + x &&
        (e.offsetY > start.y + endY) & (e.offsetY < end.y - endY)
      ) {
        // 在左边
        divider.value = {
          position:'absolute',
          top: block.top + 'px',
          left:block.left + x + 'px',
          width:'0px',
          height:block.height + 'px'
        }
      } else if (
        e.offsetX >= start.x + x &&
        e.offsetY >= start.y + endY &&
        e.offsetY <= end.y - endY
      ) {
        // 在右边
        divider.value = {
          position:'absolute',
          top: block.top + 'px',
          left:block.left + x + 'px',
          height:block.height + 'px',
          width:'0px',
        }
      } else if (e.offsetY < start.y + endY) {
        // 在上面
        divider.value = {
          position:'absolute',
          top: block.top + y + 'px',
          left:block.left + 'px',
          width:block.width + 'px',
        }
       
      } else if (e.offsetY >= start.y + endY) {
         divider.value = {
          position:'absolute',
          top: block.top + y + 'px',
          left:block.left + 'px',
          width:block.width + 'px',
        }
      }

    }
  });
  middleDom.addEventListener("dragleave", (e) => {
    e.dataTransfer.dropEffect = "none";
  });
  middleDom.addEventListener("drop", (e) => {
    console.log(e);
    // 改变jsonData对象
    const blocks = jsonData.value.blocks;
    let block = null;
    let start = {};
    let end = {};
    if (currMoveBlock.value) {
      for (let i = 0; i < blocks.length; i++) {
        // 1. 当前鼠标的范围处于什么组件
        start = { x: blocks[i].left, y: blocks[i].top };
        end = {
          x: blocks[i].left + blocks[i].width,
          y: blocks[i].top + blocks[i].height,
        };
        if (
          e.offsetX >= start.x &&
          e.offsetX <= end.x &&
          e.offsetY >= start.y &&
          e.offsetY <= end.y
        ) {
          block = blocks[i];
          break;
        }
      }
      // 将图形对角线划分
      let x = block.width / 2;
      let y = block.height / 2;
      let endY = 0;
      if (e.offsetX < x) {
        endY = parseInt((e.offsetX * y) / x);
      } else {
        endY = parseInt(((x - (e.offsetX - x)) * y) / x);
      }

      if (
        e.offsetX < start.x + x &&
        (e.offsetY > start.y + endY) & (e.offsetY < end.y - endY)
      ) {
        console.log("xxxxxxxxxxxxxxxxleft");
        // 在左边
        jsonData.value.blocks.push({
          top: block.top,
          left: block.left,
          zIndex: 1,
          compName: currMoveBlock.value.compName,
          width: x,
          height: block.height,
        });
        block.left = block.left + x;
        block.width = x;
      } else if (
        e.offsetX >= start.x + x &&
        e.offsetY >= start.y + endY &&
        e.offsetY <= end.y - endY
      ) {
        console.log("xxxxxxxxxxxxxxxxright");
        // 在右边
        jsonData.value.blocks.push({
          top: block.top,
          left: block.left + x,
          zIndex: 1,
          compName: currMoveBlock.value.compName,
          width: x,
          height: block.height,
        });
        block.width = x;
      } else if (e.offsetY < start.y + endY) {
        // 在上面
        console.log("xxxxxxxxxxxxxxxxtop");
        jsonData.value.blocks.push({
          top: block.top,
          left: block.left,
          zIndex: 1,
          compName: currMoveBlock.value.compName,
          width: block.width,
          height: y,
        });
        block.top = block.top + y;
        block.height = y;
      } else if (e.offsetY >= start.y + endY) {
        //在下面
        console.log("xxxxxxxxxxxxxxxxbottom");
        jsonData.value.blocks.push({
          top: block.top + y,
          left: block.left,
          zIndex: 1,
          compName: currMoveBlock.value.compName,
          width: block.width,
          height: y,
        });
        block.height = y;
      }
      // jsonData.value.blocks.push({
      //   top: e.offsetY,
      //   left: e.offsetX,
      //   zIndex: 1,
      //   compName: currMoveBlock.value.compName,
      //   alignCenter: true,
      // });
    }
    dividerShow.value = false
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


