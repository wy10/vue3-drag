<template>
    <div class="app">
        <div>
            <Left @start="startDrag" @end="endDrag" />
        </div>
        <div style="position: relative">
            <div class="cursor-box" ref="cursorRef"></div>
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
            <div
                :style="{
                    ...divider,
                    'z-index': 100,
                    border: '2px dotted red',
                }"
                v-show="dividerShow"
            ></div>
            <!-- <div
                :style="{
                    height: '2px',
                    width: '150px',
                    background: 'red',
                    cursor: 'row-resize',
                }"
            ></div> -->
        </div>
        <div>
            <Right v-model="currentComp.compData.props" v-if="currentComp" />
        </div>
    </div>
</template>
<script setup>
import { computed, onMounted, provide, ref, nextTick, watch } from 'vue'
import { focusBlocks, currentComp } from './hooks/useHooks'
import Left from './components/left.vue'
import Right from './components/right.vue'
import Block from './components/block.vue'
import jsonFile from './data.json'
import { leftData } from './left.js'
// {"id":1,"top":0,"left":0,"zIndex":1,"compName":"trade-table","width":800,"height":800}
import DragManager from './drag/drag-manager'
import SortManager from './drag/sort-manager'
import { justPosition } from './hooks/usePositionHooks'

const dragContainer = ref(null)
const currentDrag = ref(null)
const comps = ref(leftData)
const currBusiComp = ref(null)
const cursorRef = ref(null)
const dividerRef = ref({})

let dragManager = null
let sortManager = null

const renderElement = {
    block: {
        left: function (rangeBlock) {
            const blocks = jsonData.value.blocks
            const index = blocks.findIndex((item) => item.id == rangeBlock.id)
            console.log(rangeBlock, 'xx')
            blocks[index] = {
                ...blocks[index],
                width: rangeBlock.width / 2,
                top: rangeBlock.top,
                left: rangeBlock.left + rangeBlock.width / 2,
                translateX: 0,
                translateY: 0,
            }
            blocks.push({
                id: new Date().getTime() + '',
                top: rangeBlock.top,
                left: rangeBlock.left,
                translateX: 0,
                translateY: 0,
                compName: currBusiComp.value.compName,
                width: rangeBlock.width / 2,
                height: rangeBlock.height,
                compData: JSON.parse(JSON.stringify(currBusiComp.value)),
            })
        },
        right: function (rangeBlock) {
            const blocks = jsonData.value.blocks
            const index = blocks.findIndex((item) => item.id == rangeBlock.id)
            blocks[index] = {
                ...blocks[index],
                width: rangeBlock.width / 2,
                translateX: 0,
                translateY: 0,
            }
            blocks.push({
                id: new Date().getTime() + '',
                top: rangeBlock.top,
                left: rangeBlock.left + rangeBlock.width / 2,
                translateX: 0,
                translateY: 0,
                compName: currBusiComp.value.compName,
                width: rangeBlock.width / 2,
                height: rangeBlock.height,
                compData: JSON.parse(JSON.stringify(currBusiComp.value)),
            })
        },
        top: function (rangeBlock) {
            const blocks = jsonData.value.blocks
            const index = blocks.findIndex((item) => item.id == rangeBlock.id)
            blocks[index] = {
                ...blocks[index],
                top: rangeBlock.top + rangeBlock.height / 2,
                height: rangeBlock.height / 2,
                translateX: 0,
                translateY: 0,
            }
            blocks.push({
                id: new Date().getTime() + '',
                top: rangeBlock.top,
                left: rangeBlock.left,
                translateX: 0,
                translateY: 0,
                compName: currBusiComp.value.compName,
                width: rangeBlock.width,
                height: rangeBlock.height / 2,
                compData: JSON.parse(JSON.stringify(currBusiComp.value)),
            })
        },
        bottom: function (rangeBlock) {
            const blocks = jsonData.value.blocks
            const index = blocks.findIndex((item) => item.id == rangeBlock.id)
            blocks[index] = {
                ...blocks[index],
                height: rangeBlock.height / 2,
            }
            blocks.push({
                id: new Date().getTime() + '',
                top: rangeBlock.top + rangeBlock.height / 2,
                left: rangeBlock.left,
                translateX: 0,
                translateY: 0,
                compName: currBusiComp.value.compName,
                width: rangeBlock.width,
                height: rangeBlock.height / 2,
                compData: JSON.parse(JSON.stringify(currBusiComp.value)),
            })
        },
    },
}

const jsonData = ref(JSON.parse(JSON.stringify(jsonFile)))

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
    dragManager.on('dragStart', ({ element, offsetX, offsetY }) => {
        // 将这个元素深拷贝，避免拖动过程中被改变
        currentDrag.value = element.cloneNode(true)
        // 改变鼠标盒子指针的位置，后期使用translate渲染，避免盒子闪烁
        cursorRef.value.style.left = `${offsetX}px`
        cursorRef.value.style.top = `${offsetY}px`
        cursorRef.value.style.display = 'block'
    })
    dragManager.on('dragEnd', (data) => {
        sortManager.reorder(
            cursorRef.value,
            data.element,
            currentDrag.value,
            (node1, node2) => {
                const index1 = blocks.value.findIndex(
                    (item) => item.id == node1.id,
                )
                const index2 = blocks.value.findIndex(
                    (item) => item.id == node2.id,
                )
                // 交换index1 index2 的position,width,height,left,top
                const temp = { ...jsonData.value.blocks[index1] }
                const temp2 = { ...jsonData.value.blocks[index2] }
                jsonData.value.blocks[index1] = {
                    ...temp,
                    left: temp2.left,
                    top: temp2.top,
                    width: temp2.width,
                    height: temp2.height,
                }
                jsonData.value.blocks[index2] = {
                    ...temp2,
                    left: temp.left,
                    top: temp.top,
                    width: temp.width,
                    height: temp.height,
                }
            },
        )
        cursorRef.value.style.display = 'none'
    })
    dragManager.on('dragover', (e) => {
        // justPosition(e, blocks.value, renderContent['block'])
    })
    dragManager.on('dragMove', ({ element, x, y, offsetX, offsetY }) => {
        cursorRef.value.style.transform = `translate(${x}px, ${y}px)`
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
                compName: currBusiComp.value.compName,
                width: 1,
                height: 1,
                compData: JSON.parse(JSON.stringify(currBusiComp.value)),
            })
            return
        }
        justPosition(e, dragContainer.value, blocks, renderElement['block'])
    })
})

// const renderContent = {
//     divider: function (block) {
//         const dividerWidth = block.width * container.value.width
//         const dividerHeight = block.height * container.value.height
//         return {
//             left: (x, y) => {
//                 divider.value = {
//                     position: 'absolute',
//                     top: block.top + 'px',
//                     left: block.left + x + 'px',
//                     width: '0px',
//                     height: dividerHeight + 'px',
//                 }
//             },
//             top: (x, y) => {
//                 divider.value = {
//                     position: 'absolute',
//                     top: block.top + y + 'px',
//                     left: block.left + 'px',
//                     width: dividerWidth + 'px',
//                 }
//             },
//             right: (x, y) => {
//                 divider.value = {
//                     position: 'absolute',
//                     top: block.top + 'px',
//                     left: block.left + x + 'px',
//                     height: dividerHeight + 'px',
//                     width: '0px',
//                 }
//             },
//             bottom: (x, y) => {
//                 divider.value = {
//                     position: 'absolute',
//                     top: block.top + y + 'px',
//                     left: block.left + 'px',
//                     width: dividerWidth + 'px',
//                 }
//             },
//         }
//     },
//     block: function (block, y, direction) {
//         const blockWidth = block.width * container.value.width
//         const blockHeight = block.height * container.value.height
//         let id = new Date().getTime() + ''
//         let props = {}
//         if (currBusiComp.value.type === 'table') {
//             props = {
//                 ...currBusiComp.value.props,
//                 rows: {
//                     ...currBusiComp.value.props.rows,
//                     value: ['left', 'right'].includes(direction)
//                         ? Math.floor((blockHeight - 40) / 41)
//                         : Math.floor((y - 40) / 41),
//                 },
//             }
//         }

//         return {
//             left: (x, y) => {
//                 jsonData.value.blocks.push({
//                     id,
//                     parent: block.id,
//                     top: block.top,
//                     left: block.left,
//                     zIndex: 1,
//                     compName: currBusiComp.value.compName,
//                     width: x / container.value.width,
//                     height: block.height,
//                     compData: JSON.parse(
//                         JSON.stringify({ ...currBusiComp.value, props }),
//                     ),
//                 })
//                 block.left = block.left + x
//                 block.width = x / container.value.width
//             },

//             top: (x, y) => {
//                 jsonData.value.blocks.push({
//                     id,
//                     parent: block.id,
//                     top: block.top,
//                     left: block.left,
//                     zIndex: 1,
//                     compName: currBusiComp.value.compName,
//                     width: block.width,
//                     height: y / container.value.height,
//                     compData: JSON.parse(
//                         JSON.stringify({ ...currBusiComp.value, props }),
//                     ),
//                 })
//                 block.top = block.top + y
//                 block.height = y / container.value.height
//             },
//             right: (x, y) => {
//                 jsonData.value.blocks.push({
//                     id,
//                     parent: block.id,
//                     top: block.top,
//                     left: block.left + x,
//                     zIndex: 1,
//                     compName: currBusiComp.value.compName,
//                     width: x / container.value.width,
//                     height: block.height,
//                     compData: JSON.parse(
//                         JSON.stringify({ ...currBusiComp.value, props }),
//                     ),
//                 })
//                 block.width = x / container.value.width
//             },
//             bottom: (x, y) => {
//                 jsonData.value.blocks.push({
//                     id,
//                     parent: block.id,
//                     top: block.top + y,
//                     left: block.left,
//                     zIndex: 1,
//                     compName: currBusiComp.value.compName,
//                     width: block.width,
//                     height: y / container.value.height,
//                     compData: JSON.parse(
//                         JSON.stringify({ ...currBusiComp.value, props }),
//                     ),
//                 })
//                 block.height = y / container.value.height
//             },
//         }
//     },
// }

const startDrag = (item) => {
    currBusiComp.value = item
}
const endDrag = () => {
    currBusiComp.value = null
}

provide('comps', comps)
provide('jsonData', jsonData)
</script>

<style lang="less" scoped>
.app {
    display: flex;
    & > div:first-child {
        width: 300px;
    }
    & > div:nth-child(2) {
        //flex: 1;
        margin: 10px;
        border: 1px solid #ccc;
    }
    & > div:last-child {
        width: 300px;
    }
    .cursor-box {
        position: absolute;
        border: 1px solid red;
        width: 20px;
        height: 10px;
        z-index: 2;
        display: none;
    }
}
</style>
