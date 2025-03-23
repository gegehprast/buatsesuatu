import { mat4, vec3 } from 'gl-matrix'
import shader from './shaders.wgsl?raw'
import { Uniform } from './Uniform'
import { BindGroup } from './BindGroup'
import { Pipeline } from './Pipeline'

export class Renderer {
    private canvas: HTMLCanvasElement

    private device!: GPUDevice

    private context!: GPUCanvasContext
    
    private timeUniform!: Uniform

    private mvpUniform!: Uniform

    private pipeline!: GPURenderPipeline

    private bindGroup!: GPUBindGroup

    constructor(canvas: HTMLCanvasElement) {
        if (!navigator.gpu) throw Error('WebGPU not supported.')

        this.canvas = canvas
    }

    public async initialize() {
        await this.setup()

        // Basic union buffers for time and mvp
        this.timeUniform = new Uniform(this.device, 4, 'Time Buffer')
        this.mvpUniform = new Uniform(this.device, 4 * 16 * 2, 'MVP Buffer')

        // Create bind group and pipeline
        const bindGroup = new BindGroup(this.device, 'Main')
        bindGroup.addUniformBuffer(GPUShaderStage.FRAGMENT, this.timeUniform)
        bindGroup.addUniformBuffer(GPUShaderStage.FRAGMENT, this.mvpUniform)
        bindGroup.build()
        
        // Create pipeline
        const pipeline = new Pipeline(this.device, 'Main')
        pipeline.setVertexShader(shader, 'vert_main')
        pipeline.setFragmentShader(shader, 'frag_main')
        pipeline.addBindGroupLayout(bindGroup.getLayout())
        pipeline.build()

        this.pipeline = pipeline.get()
        this.bindGroup = bindGroup.get()
    }

    public async setup() {
        const adapter = await navigator.gpu.requestAdapter({
            featureLevel: 'compatibility',
        })

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

    public render() {
        this.timeUniform.write(new Float32Array([performance.now() / 1000])).end()

        const position = vec3.fromValues(-2, 0, 0.5)
        const forward: vec3 = [
            Math.cos(0) * Math.cos(0),
            Math.sin(0) * Math.cos(0),
            Math.sin(0),
        ]
        const right = vec3.create()
        vec3.cross(right, forward, [0, 0, 1])
        const up = vec3.create()
        vec3.cross(up, right, forward)
        const target = vec3.create()
        vec3.add(target, position, forward)
        const view = mat4.create()
        mat4.lookAt(view, position, target, up)

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

        this.mvpUniform.write(viewArray)
        this.mvpUniform.write(projectionArray)
        this.mvpUniform.end()

        const commandEncoder = this.device.createCommandEncoder({
            label: 'command encoder',
        })
        const textureView = this.context.getCurrentTexture().createView()
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            label: `Renderpass`,
        })
        
        passEncoder.setPipeline(this.pipeline)
        passEncoder.setBindGroup(0, this.bindGroup)
        passEncoder.draw(3, 1, 0, 0)
        passEncoder.end()
        
        this.device.queue.submit([commandEncoder.finish()])
    }
}
