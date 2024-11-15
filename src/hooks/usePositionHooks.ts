export const justPosition = (e: MouseEvent, parent, blocks, render) => {
    const rect = parent.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top
    let block = {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
    }
    let start = {
        x: 0,
        y: 0,
    }
    let end = {
        x: 0,
        y: 0,
    }

    for (let i = 0; i < blocks.length; i++) {
        // 1. 当前鼠标的范围处于什么组件
        start = { x: blocks[i].left * 800, y: blocks[i].top * 800 }
        end = {
            x: (blocks[i].left + blocks[i].width) * 800,
            y: (blocks[i].top + blocks[i].height) * 800,
        }
        if (
            offsetX >= start.x &&
            offsetX <= end.x &&
            offsetY >= start.y &&
            offsetY <= end.y
        ) {
            block = blocks[i]
            break
        }
    }
    // 将图形对角线划分
    let x = (block.width * 800) / 2
    let y = (block.height * 800) / 2
    let endY = 0

    if (offsetX < block.left + x) {
        endY = parseInt(((offsetX - block.left) * y) / x + '')
    } else {
        endY = parseInt(((block.left + block.width - offsetX) * y) / x + '')
        console.log('xxxx', endY, offsetY, offsetX)
    }

    if (
        offsetX < start.x + x &&
        offsetY > start.y + endY &&
        offsetY < end.y - endY
    ) {
        console.log('xxxxxxxxxxleft')
        // 在左边
        render.left(block)
    } else if (
        offsetX >= start.x + x &&
        offsetY >= start.y + endY &&
        offsetY <= end.y - endY
    ) {
        console.log('xxxxxxxxxxright', endY)
        // 在右边
        render.right(block)
    } else if (offsetY < start.y + endY) {
        console.log('xxxxxxxxxxtop')
        // 在上面
        render.top(block)
    } else if (offsetY >= start.y + endY) {
        // 在下面
        render.bottom(block)
    }
}
