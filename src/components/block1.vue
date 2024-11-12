<template>
    <div
        :style="blockStyle"
        :class="{ 'block-focus': block.focus }"
        @mousedown="mousedown"
        @click.stop
    >
        <div style="height: 20px; overflow: hidden">
            <!-- {{ compDataProps.title.value }} -->
        </div>
        <div
            :style="{
                width: blockStyle.width,
                height: '2px',
                background: 'red',
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 100,
            }"
            class="top"
        ></div>
        <div
            :style="{
                width: '2px',
                height: blockStyle.height,
                background: 'red',
                position: 'absolute',
                left: block.left + block.width * container.width - 2 + 'px',
                top: 0,
                zIndex: 100,
            }"
            class="right"
            :id="block.id + 'right'"
            @mousedown.stop="rightmousedown($event, `${block.id}right`)"
        ></div>
        <div
            :style="{
                width: blockStyle.width,
                height: '2px',
                background: 'red',
                position: 'absolute',
                left: 0,
                top: block.top + block.height * container.height - 2 + 'px',
                zIndex: 100,
            }"
            class="bottom"
        ></div>

        <div
            :style="{
                width: '2px',
                height: blockStyle.height,
                background: 'red',
                position: 'absolute',
                left: 0,
                top: 0,
                zIndex: 100,
            }"
            class="left"
        ></div>
        <component
            :is="block.compName"
            ref="blockRef"
            :id="block.id"
            style="height: calc(100% - 40px); width: 100%; user-select: none"
            :filter="compDataProps"
        >
        </component>
    </div>
</template>
<script setup>
import { computed, ref, onMounted, toRef, nextTick, watch } from 'vue'

const emits = defineEmits(['renderBlock', 'blockMousedown'])

const props = defineProps({
    block: {},
    index: {},
    container: {},
})

const blockRef = ref()

const compData = computed(() => {
    console.log(props.block)
    return props.block.compData
})

const compDataProps = toRef(compData.value, 'props')

const blockStyle = computed(() => {
    return {
        position: 'absolute',
        top: props.block.top + 'px',
        left: props.block.left + 'px',
        width: props.block.width * props.container.width + 'px',
        height: props.block.height * props.container.height + 'px',
        'pointer-events': props.block.pointerEvent,
        overflow: 'hidden',
    }
})
let startX = ''
let startY = ''
let right
const rightmousedown = (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    startX = e.clientX
    startY = e.clientY
    right = document.getElementById(id)
    console.log(id, right)
    document.addEventListener('mousemove', rightmousemove)
    document.addEventListener('mouseup', mouseup)
}

const rightmousemove = (e) => {
    // console.log(e, 'xx')
    const { clientX, clientY } = e
    const offsetX = clientX - startX
    const offsetY = clientY - startY
    console.log(offsetX, 'xxxx')
    right.style.left =
        props.block.left +
        props.block.width * props.container.width -
        2 +
        offsetX +
        'px'
    // let width = props.block.width * props.container.width
    // props.block.width = (width - offsetX) / props.container.width
}
const mouseup = () => {
    document.removeEventListener('mousemove', rightmousemove)
    document.removeEventListener('mouseup', mouseup)
}
const mousedown = (e) => {
    emits('blockMousedown', e, props.block)
}

watch(
    () => props.block,
    () => {
        console.log(props.block)
    },
)

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
<style lang="less" scoped>
.block-focus {
    border: 2px dotted red;
    box-sizing: border-box;
    //  cursor: move;
}
.top:hover,
.bottom:hover {
    cursor: row-resize;
    z-index: 1;
}
.left:hover,
.right:hover {
    cursor: col-resize;
    z-index: 1;
}
</style>
