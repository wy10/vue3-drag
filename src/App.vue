<template>
    <div @click="add">+++</div>
    <div @click="dec">---</div>
    <div class="app" @click="clearAll">
        <div>
            <Left @start="startDrag" @end="endDrag" />
        </div>
        <div style="position: relative">
            <Middle v-model="jsonData" id="middle" />
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
import { computed, onMounted, provide, ref } from 'vue'
import { focusBlocks, currentComp } from './hooks/useHooks'
import Left from './components/left.vue'
import Right from './components/right.vue'
import Middle from './components/middle.vue'
import jsonFile from './data.json'
import { leftData } from './left.js'
// {"id":1,"top":0,"left":0,"zIndex":1,"compName":"trade-table","width":800,"height":800}

let middleDom = null

const comps = ref(leftData)

const jsonData = ref(JSON.parse(JSON.stringify(jsonFile)))
const container = computed(() => {
    return {
        width: jsonData.value.container.width,
        height: jsonData.value.container.height,
    }
})

const currMoveBlock = ref(null)
const add = () => {
    jsonData.value.container.width += 50
    jsonData.value.container.height += 50
}

const dec = () => {
    jsonData.value.container.width -= 50
    jsonData.value.container.height -= 50
}

const renderContent = {
    divider: function (block) {
        const dividerWidth = block.width * container.value.width
        const dividerHeight = block.height * container.value.height
        return {
            left: (x, y) => {
                divider.value = {
                    position: 'absolute',
                    top: block.top + 'px',
                    left: block.left + x + 'px',
                    width: '0px',
                    height: dividerHeight + 'px',
                }
            },
            top: (x, y) => {
                divider.value = {
                    position: 'absolute',
                    top: block.top + y + 'px',
                    left: block.left + 'px',
                    width: dividerWidth + 'px',
                }
            },
            right: (x, y) => {
                divider.value = {
                    position: 'absolute',
                    top: block.top + 'px',
                    left: block.left + x + 'px',
                    height: dividerHeight + 'px',
                    width: '0px',
                }
            },
            bottom: (x, y) => {
                divider.value = {
                    position: 'absolute',
                    top: block.top + y + 'px',
                    left: block.left + 'px',
                    width: dividerWidth + 'px',
                }
            },
        }
    },
    block: function (block, y, direction) {
        const blockWidth = block.width * container.value.width
        const blockHeight = block.height * container.value.height
        let id = new Date().getTime() + ''
        let props = {}
        if (currMoveBlock.value.type === 'table') {
            props = {
                ...currMoveBlock.value.props,
                rows: {
                    ...currMoveBlock.value.props.rows,
                    value: ['left', 'right'].includes(direction)
                        ? Math.floor((blockHeight - 40) / 41)
                        : Math.floor((y - 40) / 41),
                },
            }
        }

        return {
            left: (x, y) => {
                jsonData.value.blocks.push({
                    id,
                    parent: block.id,
                    top: block.top,
                    left: block.left,
                    zIndex: 1,
                    compName: currMoveBlock.value.compName,
                    width: x / container.value.width,
                    height: block.height,
                    compData: JSON.parse(
                        JSON.stringify({ ...currMoveBlock.value, props }),
                    ),
                })
                block.left = block.left + x
                block.width = x / container.value.width
            },

            top: (x, y) => {
                jsonData.value.blocks.push({
                    id,
                    parent: block.id,
                    top: block.top,
                    left: block.left,
                    zIndex: 1,
                    compName: currMoveBlock.value.compName,
                    width: block.width,
                    height: y / container.value.height,
                    compData: JSON.parse(
                        JSON.stringify({ ...currMoveBlock.value, props }),
                    ),
                })
                block.top = block.top + y
                block.height = y / container.value.height
            },
            right: (x, y) => {
                jsonData.value.blocks.push({
                    id,
                    parent: block.id,
                    top: block.top,
                    left: block.left + x,
                    zIndex: 1,
                    compName: currMoveBlock.value.compName,
                    width: x / container.value.width,
                    height: block.height,
                    compData: JSON.parse(
                        JSON.stringify({ ...currMoveBlock.value, props }),
                    ),
                })
                block.width = x / container.value.width
            },
            bottom: (x, y) => {
                jsonData.value.blocks.push({
                    id,
                    parent: block.id,
                    top: block.top + y,
                    left: block.left,
                    zIndex: 1,
                    compName: currMoveBlock.value.compName,
                    width: block.width,
                    height: y / container.value.height,
                    compData: JSON.parse(
                        JSON.stringify({ ...currMoveBlock.value, props }),
                    ),
                })
                block.height = y / container.value.height
            },
        }
    },
}

const startDrag = (item) => {
    currMoveBlock.value = item
    const blocks = jsonData.value.blocks
    blocks.forEach((item) => (item.pointerEvent = 'none'))
}
const endDrag = () => {
    currMoveBlock.value = null
    const blocks = jsonData.value.blocks
    blocks.forEach((item) => (item.pointerEvent = 'auto'))
}

const clearAll = () => {
    jsonData.value.blocks.forEach((item) => {
        item.focus = false
    })
    focusBlocks.value = []
}

const divider = ref({})
const dividerShow = ref(false)

provide('comps', comps)
provide('jsonData', jsonData)

const justPosition = (e, renderType) => {
    const blocks = jsonData.value.blocks
    let block = null
    let start = {}
    let end = {}
    if (currMoveBlock.value) {
        for (let i = 0; i < blocks.length; i++) {
            // 1. 当前鼠标的范围处于什么组件
            start = { x: blocks[i].left, y: blocks[i].top }
            end = {
                x: blocks[i].left + blocks[i].width * container.value.width,
                y: blocks[i].top + blocks[i].height * container.value.height,
            }
            if (
                e.offsetX >= start.x &&
                e.offsetX <= end.x &&
                e.offsetY >= start.y &&
                e.offsetY <= end.y
            ) {
                block = blocks[i]
                break
            }
        }
        // 将图形对角线划分
        let x = (block.width * container.value.width) / 2
        let y = (block.height * container.value.height) / 2
        let endY = 0

        if (e.offsetX < block.left + x) {
            endY = parseInt(((e.offsetX - block.left) * y) / x)
        } else {
            endY = parseInt(((block.left + block.width - e.offsetX) * y) / x)
        }

        if (
            e.offsetX < start.x + x &&
            (e.offsetY > start.y + endY) & (e.offsetY < end.y - endY)
        ) {
            console.log('xxxxxxxxxxleft')

            // 在左边
            renderContent[renderType](block, y, 'left').left(x, y)
        } else if (
            e.offsetX >= start.x + x &&
            e.offsetY >= start.y + endY &&
            e.offsetY <= end.y - endY
        ) {
            console.log('xxxxxxxxxxright', endY)
            // 在右边
            renderContent[renderType](block, y, 'right').right(x, y)
        } else if (e.offsetY < start.y + endY) {
            console.log('xxxxxxxxxxtop')
            // 在上面
            renderContent[renderType](block, y, 'top').top(x, y)
        } else if (e.offsetY >= start.y + endY) {
            console.log('xxxxxxxxxxbottom')
            // 在下面
            renderContent[renderType](block, y, 'bottom').bottom(x, y)
        }
    }
}

onMounted(() => {
    middleDom = document.getElementById('middle')
    middleDom.addEventListener('dragenter', (e) => {
        e.dataTransfer.dropEffect = 'move'
    })
    middleDom.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (jsonData.value.blocks.length) {
            justPosition(e, 'divider')
            dividerShow.value = true
        }
    })
    middleDom.addEventListener('dragleave', (e) => {
        e.dataTransfer.dropEffect = 'none'
    })
    middleDom.addEventListener('drop', (e) => {
        // 改变jsonData对象
        const blocks = jsonData.value.blocks
        if (!blocks.length) {
            blocks.push({
                id: new Date().getTime() + '',
                top: 0,
                left: 0,
                zIndex: 1,
                compName: currMoveBlock.value.compName,
                width: 1,
                height: 1,
                compData: JSON.parse(JSON.stringify(currMoveBlock.value)),
            })
        } else {
            justPosition(e, 'block')
        }
        currentComp.value = blocks[blocks.length - 1]
        // 自由移动
        // jsonData.value.blocks.push({
        //   top: e.offsetY,
        //   left: e.offsetX,
        //   zIndex: 1,
        //   compName: currMoveBlock.value.compName,
        //   alignCenter: true,
        // });
        dividerShow.value = false
    })
})
</script>

<style lang="less" scoped>
.app {
    display: flex;
    & > div:first-child {
        width: 300px;
    }
    & > div:nth-child(2) {
        flex: 1;
        margin: 10px;
    }
    & > div:last-child {
        width: 300px;
    }
}
</style>
