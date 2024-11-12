class EventEmitter {
    public events: object
    constructor() {
        this.events = {}
    }
    public on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(listener)
    }

    public emit(event, data) {
        if (!this.events[event]) return
        this.events[event].forEach((item) => {
            item(data)
        })
    }
}

export default EventEmitter
