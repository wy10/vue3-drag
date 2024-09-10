<template>
    <div
        :style="blockStyle"
        :class="{ 'block-focus': block.focus }"
        @mousedown="mousedown"
        @click.stop
    >
        <h3>{{ compDataProps.title.value }}</h3>
        <component
            :is="block.compName"
            :key="block.compName"
            ref="blockRef"
            style="height: 100%; width: 100%"
        >
        </component>
    </div>
</template>
<script setup>
import { computed, ref, inject, onMounted, toRef } from "vue"
import { focusBlocks } from "../hooks/useHooks"

const emits = defineEmits(["renderBlock", "blockMousedown"])
const jsonData = inject("jsonData")

const props = defineProps({
    block: {},
    index: {},
})

const blockRef = ref()

const compData = computed(() => {
    return props.block.compData
})

console.log(compData.value)

const compDataProps = toRef(compData.value, "props")

const blockStyle = computed(() => {
    return {
        position: "absolute",
        top: props.block.top + "px",
        left: props.block.left + "px",
        width: props.block.width + "px",
        height: props.block.height + "px",
        "pointer-events": props.block.pointerEvent,
        overflow: "hidden",
    }
})

const mousedown = (e) => {
    emits("blockMousedown", e, props.block)
}

onMounted(() => {
    if (props.block.alignCenter) {
        const { offsetWidth, offsetHeight } = blockRef.value
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
            props.index,
        )
    }
})
</script>
<style lang="less" scoped>
.block-focus {
    border: 2px dotted red;
    //  cursor: move;
}
</style>
