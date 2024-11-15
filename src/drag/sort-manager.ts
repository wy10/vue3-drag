class SortManager {
    public container: HTMLElement | null = null
    constructor(container) {
        this.container = container
    }
    reorder(detectEle, moveEle, startEle, callBack) {
        const childEles = Array.from(this.container!.children)
        childEles.forEach((childEle) => {
            if (
                childEle !== moveEle &&
                this.isOverlapping(childEle, detectEle)
            ) {
                const tr1 = childEle.style.transform
                const tr2 = startEle.style.transform
                childEle.style.transform = tr2
                moveEle.style.transform = tr1
                if (typeof callBack === 'function') {
                    // 这里可以通过vue的数组交换位置渲染染成
                    callBack(moveEle, childEle)
                    return
                }
                const placeholder = document.createElement('div')
                this.container?.insertBefore(placeholder, childEle)
                this.container?.insertBefore(childEle, moveEle)
                this.container?.insertBefore(moveEle, placeholder)
                this.container?.removeChild(placeholder)
            }
        })
    }
    isOverlapping(el1, el2) {
        const r1 = el1.getBoundingClientRect()
        const r2 = el2.getBoundingClientRect()
        return !(
            r1.right <= r2.left ||
            r1.left >= r2.right ||
            r1.bottom <= r2.top ||
            r1.top >= r2.bottom
        )
    }
}

export default SortManager
