<template>
    <div :style="{ ...containerStyle }">
        <Block
            v-for="item in blocks"
            :id="item.id"
            :key="item.id"
            :block="item"
            @renderBlock="renderBlock"
            @blockMousedown="blockMousedown"
        >
        </Block>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { currentComp, focusBlocks } from '../hooks/useHooks'
import { adjustCompLayout } from '../utils/delete'
import Block from './block.vue'
let startPositon = { x: 0, y: 0 }
const jsonData = defineModel()
let deleteFlag = false
// const emits = defineEmits(['blockMousedown'])

const containerStyle = computed(() => {
    return {
        width: jsonData.value.container.width + 'px',
        height: jsonData.value.container.height + 'px',
        border: '1px solid #ccc',
        borderRadius: '3px',
        padding: '5px',
        position: 'relative',
    }
})

const blocks = computed(() => {
    return jsonData.value.blocks
})

const renderBlock = (item, index) => {
    // jsonData.value.blocks[index] = item
}
const clearAllFocus = () => {
    jsonData.value.blocks.forEach((item) => {
        item.focus = false
    })
}
const blockMousedown = (e, comp) => {
    startPositon = {
        x: e.clientX,
        y: e.clientY,
        pos: {
            left: comp.left,
            top: comp.top,
        },
    }

    comp.focus = true
    clearAllFocus()
    comp.focus = true
    currentComp.value = comp
    document.addEventListener('mousemove', blockMousemove)
    document.addEventListener('mouseup', mouseUpHandler)
}
const blockMousemove = (e) => {
    let { clientX, clientY } = e
    // const offsetX = startPositon.x - clientX
    // const offsetY = startPositon.y - clientY
    // // 拿到偏移量，计算物体新位置
    // currentComp.value.top = startPositon.pos.top - offsetY
    // currentComp.value.left = startPositon.pos.left - offsetX

    const parent = document.getElementById('middle')
    const parentRect = parent.getBoundingClientRect()

    //检查鼠标是否超出边界
    if (
        (clientX < parentRect.left ||
            clientX > parentRect.right ||
            clientY < parentRect.top ||
            clientY > parentRect.bottom) &&
        currentComp.value
    ) {
        deleteFlag = true
    } else {
        deleteFlag = false
    }
}

const mouseUpHandler = (e) => {
    document.removeEventListener('mousemove', blockMousemove)
    document.removeEventListener('mouseup', mouseUpHandler)
    startPositon = {
        x: 0,
        y: 0,
    }
    if (deleteFlag) {
        if (blocks.value.length === 1) {
            jsonData.value.blocks = []
            currentComp.value === null
        } else {
            adjustCompLayout(currentComp.value, jsonData.value.blocks)
            let index = blocks.value.findIndex(
                (item) => item.id === currentComp.value.id,
            )
            jsonData.value.blocks.splice(index, 1)
            currentComp.value === null
        }
        deleteFlag = false
    }
}
</script>
