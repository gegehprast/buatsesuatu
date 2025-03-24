import { mat4 } from 'gl-matrix'
import { BindGroup } from './BindGroup'
import { Renderer } from './Renderer'
import { Scene } from './Scene'
import { Time } from './Time'
import { Uniform } from './Uniform'
import { Storage } from './Storage'

export class App {
    public canvas: HTMLCanvasElement

    public device?: GPUDevice

    public context?: GPUCanvasContext

    public renderer?: Renderer

    public uTime!: Uniform

    public uMVP!: Uniform

    public sObject!: Storage

    public bindGroup!: BindGroup

    public running: boolean = false

    public time: Time = new Time()

    public scenes: Scene[] = []

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.tick = this.tick.bind(this)
    }

    public async initialize() {
        await this.setup()

        // Basic union buffers for time and mvp
        this.uTime = new Uniform(this.device!, 4, 'Time Buffer')
        this.uMVP = new Uniform(this.device!, 4 * 16 * 3, 'MVP Buffer')

        // Object storage buffer
        this.sObject = new Storage(
            this.device!,
            4 * 16 * 1024,
            'Object Storage',
        )

        // Create main bind group
        this.bindGroup = new BindGroup(this.device!, 'Main')
        this.bindGroup.addUniformBuffer(GPUShaderStage.VERTEX, this.uTime)
        this.bindGroup.addUniformBuffer(GPUShaderStage.VERTEX, this.uMVP)
        this.bindGroup.addUniformBuffer(GPUShaderStage.FRAGMENT, this.uTime)
        this.bindGroup.addUniformBuffer(GPUShaderStage.FRAGMENT, this.uMVP)
        this.bindGroup.addStorageBUffer(GPUShaderStage.VERTEX, this.sObject)
        this.bindGroup.build()

        this.renderer = new Renderer(this.device!, this.context!)
    }

    public async setup() {
        if (!navigator.gpu) throw Error('WebGPU not supported.')

        const adapter = await navigator.gpu.requestAdapter()

        if (!adapter) throw Error("Couldn't get GPU adapter.")

        const device = await adapter.requestDevice()

        const devicePixelRatio = window.devicePixelRatio
        this.canvas.width = this.canvas.clientWidth * devicePixelRatio
        this.canvas.height = this.canvas.clientHeight * devicePixelRatio

        const context = this.canvas.getContext('webgpu')

        if (!context) throw Error("Couldn't get GPU context.")

        this.device = device
        this.context = context

        this.context.configure({
            device: this.device,
            format: 'bgra8unorm',
            alphaMode: 'opaque',
        })
    }

    private t: number = 0

    public tick() {
        if (!this.renderer) throw Error('Renderer not initialized.')

        if (!this.running) return

        this.uTime.write(new Float32Array([this.time.timeS])).end()

        this.t += 0.01

        if (this.t >= Math.PI * 2) this.t -= Math.PI * 2

        const model = mat4.create()
        mat4.rotate(model, model, this.t, [0, 1, 0])

        const view = mat4.create()
        mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0])

        const projection = mat4.create()
        mat4.perspective(
            projection,
            Math.PI / 4,
            this.canvas.width / this.canvas.height,
            0.1,
            100.0,
        )

        // convert to array buffer
        const modelArray = new Float32Array(model)
        const viewArray = new Float32Array(view)
        const projectionArray = new Float32Array(projection)

        this.uMVP.write(modelArray)
        this.uMVP.write(viewArray)
        this.uMVP.write(projectionArray)
        this.uMVP.end()

        this.renderer.render(this.scenes)

        requestAnimationFrame(this.tick)
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

    public addScene(scene: Scene) {
        this.scenes.push(scene)
    }
}
