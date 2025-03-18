import { Scene } from '../models/Scene'
import { Renderer } from '../view/Renderer'

type ControlerListener = (keyCode: string | null, mouse: [number, number]) => void

export class App {
    canvas: HTMLCanvasElement

    renderer: Renderer

    scene: Scene

    controlListener: ControlerListener[] = []

    keyCode: string | null = null

    forwardsAmount: number = 0
    rightAmount: number = 0

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.renderer = new Renderer(canvas)

        this.scene = new Scene()

        this.run = this.run.bind(this)
    }

    async initialize() {
        await this.renderer.initialize()

        window.document.addEventListener('keydown', (event) => {
            this.keyCode = event.code

            this.controlListener.forEach((listener) => {
                listener(this.keyCode, [0, 0])
            })

            if (this.keyCode === 'KeyW') {
                this.forwardsAmount = 0.02
            }

            if (this.keyCode === 'KeyS') {
                this.forwardsAmount = -0.02
            }

            if (this.keyCode === 'KeyA') {
                this.rightAmount = -0.02
            }

            if (this.keyCode === 'KeyD') {
                this.rightAmount = 0.02
            }
        })

        window.document.addEventListener('keyup', (event) => {
            this.keyCode = null

            this.controlListener.forEach((listener) => {
                listener(this.keyCode, [0, 0])
            })

            if (event.code === 'KeyW' || event.code === 'KeyS') {
                this.forwardsAmount = 0
            }

            if (event.code === 'KeyA' || event.code === 'KeyD') {
                this.rightAmount = 0
            }
        })

        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock()
        })

        this.canvas.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement !== this.canvas) return
            
            this.controlListener.forEach((listener) => {
                listener(this.keyCode, [event.clientX, event.clientY])

                this.scene.spinPlayer(
                    event.movementX * 0.06,
                    event.movementY * 0.06,
                )
            })
        })
    }

    observeControl(listener: ControlerListener) {
        this.controlListener.push(listener)
    }

    unobserveControl(listener: ControlerListener) {
        this.controlListener = this.controlListener.filter((l) => l !== listener)
    }

    run() {
        const running = true

        this.scene.update()
        this.scene.movePlayer(this.forwardsAmount, this.rightAmount)
        
        this.renderer.render(
            this.scene.getRenderables(),
        )

        if (running) {
            requestAnimationFrame(this.run)
        }
    }
}
