<template>
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
        </div>
        <div>
            <Right v-model="currentComp.compData.props" v-if="currentComp" />
        </div>
    </div>
</template>
<script setup>
import { onMounted, provide, ref } from 'vue'
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

const currMoveBlock = ref(null)

const renderContent = {
    divider: function (block) {
        return {
            left: (x, y) => {
                divider.value = {
                    position: 'absolute',
                    top: block.top + 'px',
                    left: block.left + x + 'px',
                    width: '0px',
                    height: block.height + 'px',
                }
            },
            top: (x, y) => {
                divider.value = {
                    position: 'absolute',
                    top: block.top + y + 'px',
                    left: block.left + 'px',
                    width: block.width + 'px',
                }
            },
            right: (x, y) => {
                divider.value = {
                    position: 'absolute',
                    top: block.top + 'px',
                    left: block.left + x + 'px',
                    height: block.height + 'px',
                    width: '0px',
                }
            },
            bottom: (x, y) => {
                divider.value = {
                    position: 'absolute',
                    top: block.top + y + 'px',
                    left: block.left + 'px',
                    width: block.width + 'px',
                }
            },
        }
    },
    block: function (block, y, direction) {
        let id = new Date().getTime() + ''
        let props = {}
        if (currMoveBlock.value.type === 'table') {
            props = {
                ...currMoveBlock.value.props,
                rows: {
                    ...currMoveBlock.value.props.rows,
                    value: ['left', 'right'].includes(direction)
                        ? Math.floor((block.height - 40) / 41)
                        : Math.floor((y - 40) / 41),
                },
            }
        }
        ;(block.child && block.child.length === 2) || !block.child
            ? (block.child = [id])
            : block.child.push(id)
        // if (block.child) {
        //     if (block.child.length === 2) {
        //         block.child = [id]
        //     } else {
        //         block.child.push(id)
        //     }
        // } else {
        //     block.child = [id]
        // }
        return {
            left: (x, y) => {
                jsonData.value.blocks.push({
                    id,
                    parent: block.id,
                    top: block.top,
                    left: block.left,
                    zIndex: 1,
                    compName: currMoveBlock.value.compName,
                    width: x,
                    height: block.height,
                    compData: JSON.parse(
                        JSON.stringify({ ...currMoveBlock.value, props }),
                    ),
                })
                block.left = block.left + x
                block.width = x
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
                    height: y,
                    compData: JSON.parse(
                        JSON.stringify({ ...currMoveBlock.value, props }),
                    ),
                })
                block.top = block.top + y
                block.height = y
            },
            right: (x, y) => {
                jsonData.value.blocks.push({
                    id,
                    parent: block.id,
                    top: block.top,
                    left: block.left + x,
                    zIndex: 1,
                    compName: currMoveBlock.value.compName,
                    width: x,
                    height: block.height,
                    compData: JSON.parse(
                        JSON.stringify({ ...currMoveBlock.value, props }),
                    ),
                })
                block.width = x
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
                    height: y,
                    compData: JSON.parse(
                        JSON.stringify({ ...currMoveBlock.value, props }),
                    ),
                })
                block.height = y
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
                x: blocks[i].left + blocks[i].width,
                y: blocks[i].top + blocks[i].height,
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
        let x = block.width / 2
        let y = block.height / 2
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
                width: jsonData.value.container.width,
                height: jsonData.value.container.height,
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
