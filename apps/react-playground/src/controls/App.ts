import { Scene } from '../models/Scene'
import { Renderer } from '../view/Renderer'

type ControlerListener = (keyCodes: string[], mouse: [number, number]) => void

export class App {
    private canvas: HTMLCanvasElement

    private renderer: Renderer

    private scene: Scene

    private controlListener: ControlerListener[] = []

    private forwardsAmount: number = 0
    
    private rightAmount: number = 0

    private pressedKeys: string[] = []

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.renderer = new Renderer(canvas)

        this.scene = new Scene()

        this.run = this.run.bind(this)
    }

    public async initialize() {
        await this.renderer.initialize()

        this.controlListener.push((keyCodes) => {
            this.forwardsAmount = 0
            this.rightAmount = 0

            keyCodes.forEach((keyCode) => {
                switch (keyCode) {
                    case 'KeyW':
                        this.forwardsAmount += 0.02
                        break
                    case 'KeyS':
                        this.forwardsAmount -= 0.02
                        break
                    case 'KeyA':
                        this.rightAmount -= 0.02
                        break
                    case 'KeyD':
                        this.rightAmount += 0.02
                        break
                }
            })
        })

        window.document.addEventListener('keydown', (event) => {
            if (document.pointerLockElement !== this.canvas) return

            event.preventDefault()

            if (this.pressedKeys.includes(event.code)) return

            this.pressedKeys.push(event.code)

            this.controlListener.forEach((listener) => {
                listener(this.pressedKeys, [0, 0])
            })
        })

        window.document.addEventListener('keyup', (event) => {
            if (document.pointerLockElement !== this.canvas) return
            
            event.preventDefault()

            this.pressedKeys = this.pressedKeys.filter((key) => key !== event.code)

            this.controlListener.forEach((listener) => {
                listener(this.pressedKeys, [0, 0])
            })
        })

        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock()
        })

        window.document.addEventListener('mousemove', (event) => {
            this.controlListener.forEach((listener) => {
                listener(this.pressedKeys, [event.clientX, event.clientY])

                if (document.pointerLockElement !== this.canvas) return

                this.scene.spinPlayer(
                    event.movementX * 0.06,
                    event.movementY * 0.06,
                )
            })
        })
    }

    public observeControl(listener: ControlerListener) {
        this.controlListener.push(listener)
    }

    public unobserveControl(listener: ControlerListener) {
        this.controlListener = this.controlListener.filter((l) => l !== listener)
    }

    public run() {
        const running = true

        this.scene.update()
        this.scene.movePlayer(this.forwardsAmount, this.rightAmount)
        
        this.renderer.render(
            this.scene.getRenderables(),
            this.scene.getPlayer(),
        )

        if (running) {
            requestAnimationFrame(this.run)
        }
    }
}
