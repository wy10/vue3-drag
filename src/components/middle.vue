<template>
    <div :style="{ ...containerStyle }">
        <div id="delIcon" class="delIcon" style="display: none"></div>
        <Block
            v-for="item in blocks"
            :id="item.id"
            :key="item.id"
            :block="item"
            :container="{
                width: jsonData.container.width,
                height: jsonData.container.height,
            }"
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
let del = ''
const blockMousedown = (e, comp) => {
    startPositon = {
        x: e.clientX,
        y: e.clientY,
        pos: {
            left: comp.left,
            top: comp.top,
        },
    }

    clearAllFocus()
    comp.focus = true
    currentComp.value = comp
    currentComp.value.focus = true

    // 显示delIcon,并且icon的位置为鼠标的位置
    const parent = document.getElementById('middle')
    const parentRect = parent.getBoundingClientRect()
    del = document.getElementById('delIcon')
    del.style.top = e.clientY - parentRect.top + 'px'
    del.style.left = e.clientX - parentRect.left + 'px'
    del.style.display = 'block'

    document.addEventListener('mousemove', blockMousemove)
    document.addEventListener('mouseup', mouseUpHandler)
}
const blockMousemove = (e) => {
    let { clientX, clientY } = e

    const parent = document.getElementById('middle')
    const parentRect = parent.getBoundingClientRect()

    del.style.top = e.clientY - parentRect.top + 'px'
    del.style.left = e.clientX - parentRect.left + 'px'

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
            del.style.display = 'none'
            del.style.top = 0
            del.style.left = 0
        } else {
            adjustCompLayout(currentComp.value, jsonData.value.blocks, {
                width: jsonData.value.container.width,
                height: jsonData.value.container.height,
            })
            let index = blocks.value.findIndex(
                (item) => item.id === currentComp.value.id,
            )
            jsonData.value.blocks.splice(index, 1)
            currentComp.value === null
        }
        deleteFlag = false
    }
    del.style.display = 'none'
    del.style.top = 0
    del.style.left = 0
}
</script>
<style lang="less">
.dragging {
    width: 10px;
    height: 10px;
    background: red;
}
.delIcon {
    position: absolute;
    width: 20px;
    height: 20px;
    border: 1px dotted red;
    z-index: 1000;
}
</style>
