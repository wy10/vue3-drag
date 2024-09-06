<template>
  <el-card v-for="item in compObj" :key="item.compName" >
    <template #header>{{item.title}}</template>
    <div 
      draggable="true"
      @dragstart="start(item)"
      @dragend="end"
    >{{item.preview()}}</div>
  </el-card>
</template>
<script setup>
import { inject, ref,onMounted } from "vue";

const emits = defineEmits(['start','end'])
const compObj  = inject('comps')

const currentMove = ref(null)

const start = (item)=>{
  currentMove.value = item
  emits('start',item)
}
const end = () =>{
  currentMove.value = null
   emits('end',null)
}

</script>