let arr = [
    {
        id: 0,
        child: [1],
        left: 0,
        top: 0,
        width: 200,
        height: 800,
    },
    {
        id: 1,
        parent: 0,
        child: [2],
        left: 200,
        top: 0,
        width: 100,
        height: 800,
    },
    {
        id: 2,
        parent: 1,
        child: [3],
        left: 300,
        top: 0,
        width: 100,
        height: 400,
    },
    {
        id: 3,
        parent: 2,
        child: [4, 5],
        left: 300,
        top: 400,
        width: 50,
        height: 200,
    },
    {
        id: 4,
        parent: 3,
        left: 350,
        top: 400,
        width: 50,
        height: 400,
    },
    {
        id: 5,
        parent: 3,
        left: 300,
        top: 600,
        width: 50,
        height: 200,
    },
]

const affectedChildLayout = (
    needAdjustComp,
    width,
    height,
    adjustDirection,
) => {
    if (needAdjustComp.child) {
        for (let i = 0; i < needAdjustComp.child.length; i++) {
            // 调整对象是横向调整,调整对象和调整对象的孩子是上下布局的，孩子才需要调整
            if (adjustDirection === 'horizontal') {
                if (arr[needAdjustComp.child[i]].top !== needAdjustComp.top) {
                    arr[needAdjustComp.child[i]].left = Math.min(
                        needAdjustComp.left,
                        arr[needAdjustComp.child[i]].left,
                    )
                    arr[needAdjustComp.child[i]].width =
                        arr[needAdjustComp.child[i]].width + width
                    affectedChildLayout(
                        arr[needAdjustComp.child[i]],
                        width,
                        height,
                        adjustDirection,
                    )
                }
            }
            // 调整对象是纵向调整,调整对象和调整对象的孩子是左右布局的，孩子才需要调整
            if (adjustDirection === 'vertical') {
                if (arr[needAdjustComp.child[i]].left !== needAdjustComp.left) {
                    arr[needAdjustComp.child[i]].top = Math.min(
                        needAdjustComp.top,
                        arr[needAdjustComp.child[i]].top,
                    )
                    arr[needAdjustComp.child[i]].height =
                        arr[needAdjustComp.child[i]].height + height
                    affectedChildLayout(
                        arr[needAdjustComp.child[i]],
                        width,
                        height,
                        adjustDirection,
                    )
                }
            }
        }
    }
}

// const affectedPChildLayout = (needAdjustComp, origin, adjustDirection) => {
//     if (needAdjustComp.child) {
//         for (let i = 0; i < needAdjustComp.child.length; i++) {
//             // 调整对象是横向调整,调整对象和调整对象的孩子是上下布局的，孩子才需要调整
//             if (adjustDirection === 'horizontal') {
//                 if (arr[needAdjustComp.child[i]].top !== origin.top) {
//                     arr[needAdjustComp.child[i]].width =
//                         arr[needAdjustComp.child[i]].width + origin.width
//                     affectedPChildLayout(
//                         arr[needAdjustComp.child[i]],
//                         arr[needAdjustComp.child[i]],
//                         adjustDirection,
//                     )
//                 }
//             }
//             // 调整对象是纵向调整,调整对象和调整对象的孩子是左右布局的，孩子才需要调整
//             if (adjustDirection === 'vertical') {
//                 if (arr[needAdjustComp.child[i]].left !== origin.left) {
//                     arr[needAdjustComp.child[i]].height =
//                         arr[needAdjustComp.child[i]].height + origin.height
//                     affectedPChildLayout(
//                         arr[needAdjustComp.child[i]],
//                         arr[needAdjustComp.child[i]],
//                         adjustDirection,
//                     )
//                 }
//             }
//         }
//     }
// }

export const adjustCompLayout = (comp, obj) => {
    arr = obj
    //console.log(arr, 'arr')
    // 先找child 使用child的最后一个元素
    let childLen = comp.child ? comp.child.length : 0
    if (childLen) {
        // 2种情况，1.对半分只有一个孩子，2.右、下各有一个孩子，布局上都只需要调整最后一个孩子
        let needAdjustComp = arr[comp.child[childLen - 1]]
        // let origin = JSON.stringify(needAdjustComp)
        let adjustDirection
        if (needAdjustComp.left === comp.left) {
            needAdjustComp.top = Math.min(comp.top, needAdjustComp.top)
            needAdjustComp.height = needAdjustComp.height + comp.height
            adjustDirection = 'vertical'
        }
        if (needAdjustComp.top === comp.top) {
            needAdjustComp.left = Math.min(comp.left, needAdjustComp.left)
            needAdjustComp.width = needAdjustComp.width + comp.width
            adjustDirection = 'horizontal'
        }
        // 删除对象的孩子需要删除当前删除对象的信息
        for (let i = 0; i < childLen; i++) {
            if (arr[comp.child[i]].parent === comp.id) {
                arr[comp.child[i]].parent = null
            }
        }
        // 删除对象的父亲需要删除当前对象的信息
        if (comp.parent !== null) {
            let index = arr[comp.parent].child.indexOf(comp.id)
            arr[comp.parent].child.splice(index, 1)
            !arr[comp.parent].child.length && (arr[comp.parent].child = null)
        }

        // 判断调整的对象中是否有子孩子以及子孩子如何调整
        affectedChildLayout(
            needAdjustComp,
            comp.width,
            comp.height,
            adjustDirection,
        )
    } else {
        let needAdjustComp = arr[comp.parent]
        let adjustDirection
        // 父亲只会有一个
        if (needAdjustComp) {
            if (needAdjustComp.left === comp.left) {
                // 父亲向下调整
                needAdjustComp.top = Math.min(needAdjustComp.top, comp.top)
                needAdjustComp.height = needAdjustComp.height + comp.height
                adjustDirection = 'vertical'
            }
            if (needAdjustComp.top === comp.top) {
                needAdjustComp.left = Math.min(needAdjustComp.left, comp.left)
                needAdjustComp.width = needAdjustComp.width + comp.width
                adjustDirection = 'horizontal'
            }
            // 删除父亲中关于孩子的当前信息
            let index = needAdjustComp.child.indexOf(comp.id)
            needAdjustComp.child.splice(index, 1)
            !needAdjustComp.child.length && (needAdjustComp.child = null)
            // 判断调整的对象中是否有子孩子以及子孩子如何调整
            affectedChildLayout(
                needAdjustComp,
                comp.width,
                comp.height,
                adjustDirection,
            )
            // affectedPChildLayout(needAdjustComp, comp.width, comp.height, adjustDirection)
        } else {
            // 无父无子 拖进画布的第一个节点
            // 暂不用处理
        }
    }
}

// let obj = {}
// arr.forEach((item) => {
//   obj[item.id] = item
// })

// adjustCompLayout(obj[1])
// let index = arr.findIndex((item) => item.id === obj[1].id)
// console.log(index)
// arr.splice(index, 1)
// console.log(arr)
