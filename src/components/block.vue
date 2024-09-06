<template>
  <div
    :style="blockStyle"
    :class="{ 'block-focus': block.focus }"
    @mousedown="mousedown"
    @click.stop
  >
    <component :is="block.compName" :key="block.compName" ref="blockRef" style="width:100%;height:100%">
    </component>
  </div>
</template>
<script setup>
import { computed, ref, inject, onMounted } from "vue";
import { focusBlocks, blockOffset } from "../hooks/useHooks";

const emits = defineEmits(["renderBlock", "blockMousedown"]);
const compObj = inject("comps");
const jsonData = inject("jsonData");

const props = defineProps({
  block: {},
  index: {},
});

const blockRef = ref();

const blockStyle = computed(() => {
  return {
    position: "absolute",
    top: props.block.top + "px",
    left: props.block.left + "px",
    width: props.block.width + "px",
    height: props.block.height + "px",
    "pointer-events": "none",
    overflow:'hidden'
  };
});

const clearAllFocus = () => {
  jsonData.value.blocks.forEach((item) => {
    item.focus = false;
  });
};

const mousedown = (e) => {
  if (e.shiftKey) {
    props.block.focus = !props.block.focus;
    // if (props.block.focus) {
    //   focusBlocks.value.push(props.block);
    // } else {
    //   let index = focusBlocks.value.find((item) => item.id === props.block.id);
    //   focusBlocks.value.splice(index, 1);
    // }
  } else {
    clearAllFocus();
    props.block.focus = !props.block.focus;
    focusBlocks.value = [props.block];
  }
  focusBlocks.value = jsonData.value.blocks.filter((item) => item.focus);
  emits("blockMousedown", e);
};

onMounted(() => {
  if (props.block.alignCenter) {
    const { offsetWidth, offsetHeight } = blockRef.value;
    emits(
      "renderBlock",
      {
        ...props.block,
        top: props.block.top - offsetHeight / 2,
        left: props.block.left - offsetWidth / 2,
        width: offsetWidth,
        height: offsetHeight,
        alignCenter: false,
      },
      props.index
    );
  }
});
</script>
<style lang="less" scoped>
.block-focus {
  border: 2px dotted red;
  //  cursor: move;
}
</style>
