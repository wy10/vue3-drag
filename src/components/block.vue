<template>
    <div
        :style="blockStyle"
        :class="{ 'block-focus': block.focus }"
        @mousedown="mousedown"
        @click.stop
    >
        <div style="height: 20px; overflow: hidden">
            {{ compDataProps.title.value }}
        </div>
        <component
            :is="block.compName"
            ref="blockRef"
            :id="block.id"
            style="height: calc(100% - 40px); width: 100%"
            :filter="compDataProps"
        >
        </component>
    </div>
</template>
<script setup>
import { computed, ref, onMounted, toRef, nextTick } from 'vue'

const emits = defineEmits(['renderBlock', 'blockMousedown'])

const props = defineProps({
    block: {},
    index: {},
})

const blockRef = ref()

const compData = computed(() => {
    return props.block.compData
})

const compDataProps = toRef(compData.value, 'props')

const blockStyle = computed(() => {
    return {
        position: 'absolute',
        top: props.block.top + 'px',
        left: props.block.left + 'px',
        width: props.block.width + 'px',
        height: props.block.height + 'px',
        'pointer-events': props.block.pointerEvent,
        overflow: 'hidden',
    }
})

const mousedown = (e) => {
    emits('blockMousedown', e, props.block)
}

onMounted(() => {
    if (props.block.alignCenter) {
        const { offsetWidth, offsetHeight } = blockRef.value
        emits('renderBlock', {
            ...props.block,
            top: props.block.top - offsetHeight / 2,
            left: props.block.left - offsetWidth / 2,
            width: offsetWidth,
            height: offsetHeight,
            alignCenter: false,
        })
    }
    console.log(props.block)
    if (props.block.compData.type === 'echart') {
        const watchChartWc = new ResizeObserver(() => {
            nextTick(() => {
                blockRef.value.chart.resize()
            })
        })

        // 使用observe开启监听, onObserve可以取消监听
        watchChartWc.observe(document.getElementById(props.block.id))
    }
})
</script>
<style lang="less" scoped>
.block-focus {
    border: 2px dotted red;
    box-sizing: border-box;
    //  cursor: move;
}
</style>
