import EventEmitter from './event-emitter'
type T = {
    el: HTMLElement | null
    width: number
    height: number
}
class DragManager extends EventEmitter {
    public app: T = {
        el: null,
        width: 0,
        height: 0,
    }
    public dragElements: Array<object>
    public currentDrag: HTMLElement | null
    public startX: number = 0
    public startY: number = 0
    public initialTranslateX: number
    public initialTranslateY: number
    public _onDragMove: any
    public _onDragEnd: any

    constructor(app) {
        super()
        this.app = app
        app.el.style = `position:relative;width:${app.width}px;height:${app.height}px`
        this.currentDrag = null
        this.dragElements = []
        this._onDragMove = this.onDragMove.bind(this)
        this._onDragEnd = this.onDragEnd.bind(this)
    }

    public resister() {
        this.app.el!.addEventListener('dragenter', (e) => {
            e.dataTransfer!.dropEffect = 'move'
            this.emit('dragenter', e)
        })
        this.app.el!.addEventListener('dragover', (e) => {
            e.preventDefault()
            e.dataTransfer!.dropEffect = 'move'
            this.emit('dragover', e)
        })
        this.app.el!.addEventListener('dragleave', (e) => {
            e.dataTransfer!.dropEffect = 'none'
            this.emit('dragleave', e)
        })
        this.app.el!.addEventListener('drop', (e) => {
            this.emit('drop', e)
        })
    }

    public addDrag(dom, initX, initY) {
        this.dragElements.push(dom)
        dom.style.transform = `translate(${initX * this.app.width}px, ${initY * this.app.height}px)`
        dom.addEventListener('mousedown', this.onDragStart.bind(this))
        dom.addEventListener('touchstart', this.onDragStart.bind(this))
    }
    public onDragStart(e) {
        e.preventDefault()
        this.currentDrag = e.target
        this.startX = e.clientX
        this.startY = e.clientY
        const matrix = new DOMMatrix(this.currentDrag!.style.transform)
        this.initialTranslateX = matrix.m41
        this.initialTranslateY = matrix.m42
        this.emit('dragStart', { element: this.currentDrag })
        document.addEventListener('mousemove', this._onDragMove)
        document.addEventListener('mouseup', this._onDragEnd)
        document.addEventListener('touchmove', this._onDragMove)
        document.addEventListener('touchend', this._onDragEnd)
    }
    public onDragMove(e) {
        if (!this.currentDrag) return
        const moveX = (e.clientX || e.touches[0].clientX) - this.startX
        const moveY = (e.clientY || e.touches[0].clientY) - this.startY
        const realX = this.initialTranslateX + moveX
        const realY = this.initialTranslateY + moveY
        this.currentDrag.style.transform = `translate(${realX}px, ${realY}px)`
        this.emit('dragMove', { element: this.currentDrag, x: realX, y: realY })
    }
    public onDragEnd() {
        if (this.currentDrag) {
            this.emit('dragEnd', { element: this.currentDrag })
            this.currentDrag = null
        }
        document.removeEventListener('mousemove', this._onDragMove)
        document.removeEventListener('mouseup', this._onDragEnd)
        document.removeEventListener('touchmove', this._onDragMove)
        document.removeEventListener('touchend', this._onDragEnd)
    }
}

export default DragManager
