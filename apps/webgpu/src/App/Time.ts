export class Time {
    public time = 0

    public timeS = 0

    private interval: number = 0

    private pausedStart: number = 0

    private pausedTime: number = 0

    public tick() {
        this.pausedTime += performance.now() - this.pausedStart

        this.interval = setInterval(() => {
            const now = performance.now()
            this.time += now - this.time - this.pausedTime
            this.timeS = this.time / 1000
        }, 1)
    }

    public pause() {
        if (!this.interval) return

        clearInterval(this.interval)

        // this.time = 0
        this.pausedStart = performance.now()
    }
}
