import { Renderer } from "./Renderer"

export class App {
    private canvas: HTMLCanvasElement

    private renderer: Renderer
    
    private running: boolean = false

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.renderer = new Renderer(canvas)

        this.run = this.run.bind(this)
    }

    public async initialize() {
        await this.renderer.initialize()
    } 

    public run() {
        this.running = true
        
        this.renderer.render()

        if (this.running) {
            requestAnimationFrame(this.run)
        }
    }
}
