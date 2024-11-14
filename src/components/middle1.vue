<template>
    <div ref="dragContainer">
        <Block
            v-for="item in blocks"
            :id="item.id"
            :key="item.id"
            :initX="item.translateX"
            :initY="item.translateY"
            :block="item"
        >
        </Block>
    </div>
    <!-- <div id="delIcon" class="delIcon" style="display: none"></div>
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
        </Block> -->
</template>
<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { currentComp, focusBlocks } from '../hooks/useHooks'
import { adjustCompLayout } from '../utils/delete'
import Block from './block.vue'
import DragManager from '../drag/drag-manager'
import SortManager from '../drag/sort-manager'

const dragContainer = ref(null)
const currentDrag = ref(null)
let dragManager = null
let sortManager = null

const jsonData = defineModel()

const blocks = computed(() => {
    return jsonData.value.blocks
})

watch(
    () => blocks.value.length,
    () => {
        nextTick(() => {
            Array.from(dragContainer.value.children).forEach((dom) => {
                dragManager.addDrag(
                    dom,
                    dom.getAttribute('initX'),
                    dom.getAttribute('initY'),
                )
            })
        })
    },
    {
        immediate: false,
    },
)

onMounted(() => {
    dragManager = new DragManager({
        el: dragContainer.value,
        width: 800,
        height: 800,
    })
    // 在父盒子上监听物体移动事件
    dragManager.resister()
    sortManager = new SortManager(dragContainer.value)
    Array.from(dragContainer.value.children).forEach((dom) => {
        dragManager.addDrag(
            dom,
            dom.getAttribute('initX'),
            dom.getAttribute('initY'),
        )
    })
    dragManager.on('dragStart', (data) => {
        // 将这个元素深拷贝，避免拖动过程中被改变
        currentDrag.value = data.element.cloneNode(true)
    })
    dragManager.on('dragEnd', (data) => {
        sortManager.reorder(data.element, currentDrag.value, (node1, node2) => {
            const index1 = blocks.value.findIndex((item) => item.id == node1.id)
            const index2 = blocks.value.findIndex((item) => item.id == node2.id)
            const temp = { ...jsonData.value.blocks[index1] }
            jsonData.value.blocks[index1].width =
                jsonData.value.blocks[index2].width
            jsonData.value.blocks[index1].height =
                jsonData.value.blocks[index2].height
            jsonData.value.blocks[index2].width = temp.width
            jsonData.value.blocks[index2].height = temp.height
            ;[jsonData.value.blocks[index1], jsonData.value.blocks[index2]] = [
                jsonData.value.blocks[index2],
                jsonData.value.blocks[index1],
            ]
        })
    })
    // 放置物体操作
    dragManager.on('drop', (e) => {
        const blocks = jsonData.value.blocks
        if (!blocks.length) {
            blocks.push({
                id: new Date().getTime() + '',
                top: 0,
                left: 0,
                translateX: 0,
                translateY: 0,
                zIndex: 1,
                compName: currMoveBlock.value.compName,
                width: 1,
                height: 1,
                compData: JSON.parse(JSON.stringify(currMoveBlock.value)),
            })
        }
    })
})

let startPositon = { x: 0, y: 0 }

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
