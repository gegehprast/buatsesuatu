import { Renderer } from './Renderer'
import { Time } from './Time'

export class App {
    // private canvas: HTMLCanvasElement

    private renderer: Renderer

    private running: boolean = false

    private time: Time = new Time()

    constructor(canvas: HTMLCanvasElement) {
        // this.canvas = canvas

        this.renderer = new Renderer(canvas)

        this.tick = this.tick.bind(this)
    }

    public async initialize() {
        await this.renderer.initialize()
    }

    public tick() {
        if (this.running) {
            this.renderer.render(this.time.timeS)

            requestAnimationFrame(this.tick)
        }
    }

    public run() {
        console.log('Running renderer...')

        if (!this.running) {
            this.running = true
            this.time.tick()
            this.tick()
        }
    }

    public pause() {
        console.log('Pausing renderer...')
        this.time.pause()
        this.running = false
    }
}
