<template>
  <div
    :style="blockStyle"
    :class="{ 'block-focus': block.focus }"
    @mousedown="mousedown"
    @click.stop
  >
    <h3>{{compData[0].value}}</h3>
    <component :is="block.compName" :key="block.compName" ref="blockRef"  style="height:100%;width:100%">
    </component>
  </div>
</template>
<script setup>
import { computed, ref, inject, onMounted } from "vue";
import { focusBlocks } from "../hooks/useHooks";

const emits = defineEmits(["renderBlock", "blockMousedown"]);
const compObj = inject("comps");
const jsonData = inject("jsonData");

const props = defineProps({
  block: {},
  index: {},
});

const blockRef = ref();

const compData = computed(()=>{
  return compObj.value[props.block.compName].compData
})

const blockStyle = computed(() => {
  return {
    position: "absolute",
    top: props.block.top + "px",
    left: props.block.left + "px",
    width: props.block.width + "px",
    height: props.block.height + "px",
    "pointer-events": props.block.pointerEvent,
    overflow:'hidden'
  };
});



const mousedown = (e) => {
  emits("blockMousedown", e,compObj.value[props.block.compName],props.block);
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
