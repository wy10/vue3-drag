export const justPosition = (e: MouseEvent, blocks, render) => {
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
    let x = (block.width * 800) / 2
    let y = (block.height * 800) / 2
    let endY = 0

    if (e.offsetX < block.left + x) {
        endY = parseInt(((e.offsetX - block.left) * y) / x + '')
    } else {
        endY = parseInt(((block.left + block.width - e.offsetX) * y) / x + '')
        console.log('xxxx', endY, e.offsetY, e.offsetX)
    }

    if (
        e.offsetX < start.x + x &&
        e.offsetY > start.y + endY &&
        e.offsetY < end.y - endY
    ) {
        console.log('xxxxxxxxxxleft')
        // 在左边
        render.left(block)
    } else if (
        e.offsetX >= start.x + x &&
        e.offsetY >= start.y + endY &&
        e.offsetY <= end.y - endY
    ) {
        console.log('xxxxxxxxxxright', endY)
        // 在右边
        render.right(block)
    } else if (e.offsetY < start.y + endY) {
        console.log('xxxxxxxxxxtop')
        // 在上面
        render.top(block)
    } else if (e.offsetY >= start.y + endY) {
        // 在下面
        render.bottom(block)
    }
}
