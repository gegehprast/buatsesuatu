export type InputListener = (inputs: {
    isInsideCanvas: boolean,
    keys: string[], 
    mouseX: number,
    mouseY: number
    mouseMovementX: number,
    mouseMovementY: number
}) => void

export class Input {
    private canvas: HTMLCanvasElement

    private controlListener: InputListener[] = []

    private keys: string[] = []
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    public observeControl(listener: InputListener) {
        this.controlListener.push(listener)
    }

    public unobserveControl(listener: InputListener) {
        this.controlListener = this.controlListener.filter(
            (l) => l !== listener,
        )
    }

    public init() {
        window.document.addEventListener('keydown', (event) => {
            if (document.pointerLockElement !== this.canvas) return

            event.preventDefault()

            if (this.keys.includes(event.code)) return

            this.keys.push(event.code)

            this.controlListener.forEach((listener) => {
                listener({
                    isInsideCanvas: this.canvas === document.pointerLockElement,
                    keys: this.keys,
                    mouseX: 0,
                    mouseY: 0,
                    mouseMovementX: 0,
                    mouseMovementY: 0,
                })
            })
        })

        window.document.addEventListener('keyup', (event) => {
            if (document.pointerLockElement !== this.canvas) return

            event.preventDefault()

            this.keys = this.keys.filter(
                (key) => key !== event.code,
            )

            this.controlListener.forEach((listener) => {
                listener({
                    isInsideCanvas: this.canvas === document.pointerLockElement,
                    keys: this.keys,
                    mouseX: 0,
                    mouseY: 0,
                    mouseMovementX: 0,
                    mouseMovementY: 0,
                })
            })
        })

        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock()
        })

        window.document.addEventListener('mousemove', (event) => {
            this.controlListener.forEach((listener) => {
                listener({
                    isInsideCanvas: this.canvas === document.pointerLockElement,
                    keys: this.keys,
                    mouseX: event.clientX,
                    mouseY: event.clientY,
                    mouseMovementX: event.movementX,
                    mouseMovementY: event.movementY,
                })
            })
        })
    }
}
