<template>
    <div :style="blockStyleFn">
        <component
            :is="block.compName"
            ref="blockRef"
            :style="{ 'pointer-events': 'none', ...compStyleFn }"
        ></component>
    </div>
</template>
<script setup>
import { computed, onMounted, nextTick, ref } from 'vue'

const props = defineProps({
    block: {},
})

const blockRef = ref(null)

const blockStyleFn = computed(() => {
    return {
        width: `${props.block.width * 800}px`,
        height: `${props.block.height * 800}px`,
        position: 'absolute',
        left: `${props.block.left * 800}px`,
        top: `${props.block.top * 800}px`,
    }
})

const compStyleFn = computed(() => {
    return {
        width: `${props.block.width * 800}px`,
        height: `${props.block.height * 800}px`,
    }
})

onMounted(() => {
    if (props.block.compData.type === 'echart') {
        const watchChartWc = new ResizeObserver(() => {
            nextTick(() => {
                blockRef.value && blockRef.value.chart.resize()
            })
        })

        // 使用observe开启监听, onObserve可以取消监听
        watchChartWc.observe(document.getElementById(props.block.id))
        window.addEventListener('resize', function () {
            // 在事件触发时，调用图表实例的 resize 方法
            blockRef.value && blockRef.value.chart.resize()
        })
    }
})
</script>
