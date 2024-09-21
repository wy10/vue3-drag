// let arr = [
//   {
//       id: 0,
//       left: 0,
//       top: 0,
//       width: 200,
//       height: 800,
//   },
//   {
//       id: 1,
//       left: 200,
//       top: 0,
//       width: 100,
//       height: 800,
//   },
//   {
//       id: 2,
//       left: 300,
//       top: 0,
//       width: 100,
//       height: 400,
//   },
//   {
//       id: 3,
//       left: 300,
//       top: 400,
//       width: 50,
//       height: 200,
//   },
//   {
//       id: 4,
//       left: 350,
//       top: 400,
//       width: 50,
//       height: 400,
//   },
//   {
//       id: 5,
//       left: 300,
//       top: 600,
//       width: 50,
//       height: 200,
//   },
// ]

export const adjustCompLayout = (comp, arr) => {
    // 求取comp四条边的坐标范围
    // 上 top ->        [left,left + width]
    // 右 left+width -> [top,top+height]
    // 下 top+height -> [left,left + width]
    // 左 left ->       [top,top+height]
    let borderInfo = {
        top: [],
        right: [],
        bottom: [],
        left: [],
    }
    let maxRight = comp.left + comp.width
    let maxHeight = comp.top + comp.height

    for (let i = 0; i < arr.length; i++) {
        let box = arr[i]
        // console.log(box)
        let boxMaxRight = box.left + box.width
        let boxMaxHeight = box.top + box.height
        // 上边和其他盒子的下边重合情况
        if (
            comp.top === boxMaxHeight &&
            box.left >= comp.left &&
            boxMaxRight <= maxRight
        ) {
            borderInfo.top.push(box)
            continue
        }
        if (
            maxRight === box.left &&
            box.top >= comp.top &&
            boxMaxHeight <= maxHeight
        ) {
            borderInfo.right.push(box)
            continue
        }
        if (
            maxHeight === box.top &&
            box.left >= comp.left &&
            boxMaxRight <= maxRight
        ) {
            borderInfo.bottom.push(box)
            continue
        }
        if (
            comp.left === boxMaxRight &&
            box.top >= comp.top &&
            boxMaxHeight <= maxHeight
        ) {
            borderInfo.left.push(box)
            continue
        }
    }
    // 获取长度不为零的最小数组
    let minLenArr = new Array(arr.length)
    let direction = ''
    Object.keys(borderInfo).forEach((key) => {
        if (
            borderInfo[key].length !== 0 &&
            borderInfo[key].length <= minLenArr.length
        ) {
            minLenArr = borderInfo[key]
            direction = key
        }
    })
    switch (direction) {
        case 'top':
            minLenArr.forEach((item) => {
                item.height = item.height + comp.height
            })
            break
        case 'right':
            minLenArr.forEach((item) => {
                item.left = comp.left
                item.width = item.width + comp.width
            })
            break
        case 'bottom':
            minLenArr.forEach((item) => {
                item.top = comp.top
                item.height = item.height + comp.height
            })
            break
        case 'left':
            minLenArr.forEach((item) => {
                item.width = item.width + comp.width
            })
            break
    }
}

// adjustCompLayout(arr[3])
// console.log(arr)
