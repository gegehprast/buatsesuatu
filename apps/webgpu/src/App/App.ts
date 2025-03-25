import { mat4 } from 'gl-matrix'
import { BindGroup } from './BindGroup'
import { Renderer } from './Renderer'
import { Scene } from './Scene'
import { Time } from './Time'
import { Uniform } from './Uniform'
import { Storage } from './Storage'
import { Camera } from './Camera'
import { Input } from './Input'


export class App {
    public canvas: HTMLCanvasElement

    public device?: GPUDevice

    public context?: GPUCanvasContext

    public renderer?: Renderer

    public uTime?: Uniform

    public uMVP?: Uniform

    public sObject?: Storage

    public bindGroup?: BindGroup

    public running: boolean = false

    public time: Time = new Time()

    public scenes: Scene[] = []

    public input: Input
    
    private camera: Camera

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.input = new Input(this.canvas)

        this.camera = new Camera([0, 0, -4], 0, 0, this)

        this.tick = this.tick.bind(this)
    }

    public async initialize() {
        await this.setup()

        this.setupBindings()

        this.setupRenderer()

        this.input.init()
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
        if (!this.device) throw Error('Device not initialized.')

        if (!this.context) throw Error('Context not initialized.')

        if (!this.bindGroup) throw Error('Bind group not initialized.')

        for (const object of scene.objects) {
            object.mesh.init(this.device, this.context, this.bindGroup)
        }

        scene.build()

        this.scenes.push(scene)
    }

    private async setup() {
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

    private setupBindings() {
        if (!this.device) throw Error('Device not initialized.')

        // Basic union buffers for time and mvp
        this.uTime = new Uniform(this.device, 4, 'Time Buffer')
        this.uMVP = new Uniform(this.device, 4 * 16 * 2, 'MVP Buffer')

        // Object storage buffer
        this.sObject = new Storage(
            this.device!,
            4 * 16 * 1024,
            'Object Storage',
        )

        // Create main bind group
        this.bindGroup = new BindGroup(this.device, 'Main')
        this.bindGroup.addUniformBuffer(GPUShaderStage.VERTEX, this.uTime)
        this.bindGroup.addUniformBuffer(GPUShaderStage.VERTEX, this.uMVP)
        this.bindGroup.addUniformBuffer(GPUShaderStage.FRAGMENT, this.uTime)
        this.bindGroup.addUniformBuffer(GPUShaderStage.FRAGMENT, this.uMVP)
        this.bindGroup.addStorageBUffer(GPUShaderStage.VERTEX, this.sObject)
        this.bindGroup.build()
    }

    private setupRenderer() {
        if (!this.device) throw Error('Device not initialized.')

        if (!this.context) throw Error('Context not initialized.')

        this.renderer = new Renderer(this.device, this.context)
    }

    private writeBuffers() {
        if (!this.uTime) throw Error('Time uniform not initialized.')
        if (!this.uMVP) throw Error('MVP uniform not initialized.')
        if (!this.sObject) throw Error('Object storage not initialized.')

        this.uTime.write(new Float32Array([this.time.timeS])).end()

        const view = this.camera.getView()

        const projection = mat4.create()
        mat4.perspective(
            projection,
            Math.PI / 4,
            this.canvas.width / this.canvas.height,
            0.1,
            100.0,
        )

        // convert to array buffer
        const viewArray = new Float32Array(view)
        const projectionArray = new Float32Array(projection)

        this.uMVP.write(viewArray)
        this.uMVP.write(projectionArray)
        this.uMVP.end()

        // update all scenes
        for (const scene of this.scenes) {
            scene.update()
            this.sObject.writeF(scene.objectData).end()
        }
    }

    public tick() {
        if (!this.renderer) throw Error('Renderer not initialized.')

        if (!this.running) return

        this.camera.update()

        this.writeBuffers()

        this.renderer.render(this.scenes)

        requestAnimationFrame(this.tick)
    }

    
}
