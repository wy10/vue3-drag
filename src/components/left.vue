<template>
    <el-card v-for="item in comps" :key="item.compName">
        <template #header>{{ item.title }}</template>
        <div
            draggable="true"
            @dragstart="() => emits('start', item)"
            @dragend="() => emits('end', null)"
        >
            {{ item.preview() }}
        </div>
    </el-card>
</template>
<script setup>
import { inject, ref, onMounted } from "vue"

const emits = defineEmits(["start", "end"])
const comps = inject("comps")
</script>
