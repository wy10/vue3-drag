<template>
    <div :style="{...containerStyle}">
        <Block 
            v-for="(item,index) in blocks" 
            :id="item.compName+index"
            :key="index"
            :block="item"
            :index="index"
            @renderBlock="renderBlock"
            @blockMousedown="blockMousedown"
        >
        </Block>
    </div>
</template>
<script setup>
import { computed, inject, nextTick, render,ref } from "vue"
import { currentComp, focusBlocks } from "../hooks/useHooks";
import Block from './block.vue'

const jsonData = defineModel()
let startPositon = {x:0,y:0}
// const emits = defineEmits(['blockMousedown'])

const containerStyle = computed(()=>{
    return {
        width:jsonData.value.container.width + 'px',
        height:jsonData.value.container.height + 'px',
        border:'1px solid #ccc',
        borderRadius:'3px',
        padding:'5px',
        position:'relative'
    }
})

const blocks = computed(()=>{
    return jsonData.value.blocks
})

const renderBlock = (item,index) =>{
    // jsonData.value.blocks[index] = item
}
const clearAllFocus = () => {
  jsonData.value.blocks.forEach((item) => {
    item.focus = false;
  });
};
const blockMousedown = (e,item,comp) => {
  startPositon = {
    x:e.clientX,
    y:e.clientY,
    pos:focusBlocks.value.map(item=>{
        return {
            left:item.left,
            top:item.top
        }
    })
  }
  console.log(item,blocks.value)
  let block = blocks.value.find(v=>v.id === comp.id)
  clearAllFocus()
  block.focus = true
  currentComp.value = item
  document.addEventListener("mousemove", blockMousemove);
  document.addEventListener('mouseup', mouseUpHandler);
};
const blockMousemove = (e) => {
  // let { clientX,clientY} = e
  // const offsetX = startPositon.x - clientX
  // const offsetY = startPositon.y - clientY

  // // 拿到偏移量，计算物体新位置
  // focusBlocks.value.forEach((item,index)=>{
  //   item.top = startPositon.pos[index].top - offsetY
  //   item.left = startPositon.pos[index].left - offsetX
  // })
};

const mouseUpHandler = (e) => {
  document.removeEventListener("mousemove", blockMousemove);
  document.removeEventListener("mouseup", mouseUpHandler);
  startPositon = {
    x:0,
    y:0
  }
};


</script>
