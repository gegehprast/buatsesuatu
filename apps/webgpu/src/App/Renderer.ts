import { mat4 } from 'gl-matrix'
import shader from './shaders.wgsl?raw'
import { Uniform } from './Uniform'
import { BindGroup } from './BindGroup'
import { Pipeline } from './Pipeline'
import { TriangleMesh } from './Geometry/Triangle'

export class Renderer {
    private canvas: HTMLCanvasElement

    private device!: GPUDevice

    private context!: GPUCanvasContext
    
    private timeUniform!: Uniform

    private mvpUniform!: Uniform

    private pipeline!: GPURenderPipeline

    private bindGroup!: GPUBindGroup

    private triangle!: TriangleMesh

    constructor(canvas: HTMLCanvasElement) {
        if (!navigator.gpu) throw Error('WebGPU not supported.')

        this.canvas = canvas
    }

    public async initialize() {
        await this.setup()

        // Basic union buffers for time and mvp
        this.timeUniform = new Uniform(this.device, 4, 'Time Buffer')
        this.mvpUniform = new Uniform(this.device, 4 * 16 * 3, 'MVP Buffer')

        // Create bind group and pipeline
        const bindGroup = new BindGroup(this.device, 'Main')
        bindGroup.addUniformBuffer(GPUShaderStage.VERTEX, this.timeUniform)
        bindGroup.addUniformBuffer(GPUShaderStage.VERTEX, this.mvpUniform)
        bindGroup.addUniformBuffer(GPUShaderStage.FRAGMENT, this.timeUniform)
        bindGroup.addUniformBuffer(GPUShaderStage.FRAGMENT, this.mvpUniform)
        bindGroup.build()
        
        // Create assets
        this.triangle = new TriangleMesh(this.device)

        // Create pipeline
        const pipeline = new Pipeline(this.device, 'Main')
        pipeline.addVertexBufferLayout(this.triangle.bufferLayout)
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

    private t: number = 0

    public render() {
        this.timeUniform.write(new Float32Array([performance.now() / 1000])).end()

        this.t += 0.01

        if (this.t >= Math.PI * 2) this.t -= Math.PI * 2
            
        const model = mat4.create()
        mat4.rotate(model, model, this.t, [0, 1, 0]);

        const view = mat4.create()
        mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);

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

        this.mvpUniform.write(modelArray)
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
                    clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            label: `Renderpass`,
        })
        
        passEncoder.setPipeline(this.pipeline)
        passEncoder.setBindGroup(0, this.bindGroup)
        passEncoder.setVertexBuffer(0, this.triangle.buffer)
        passEncoder.draw(3, 1, 0, 0)
        passEncoder.end()
        
        this.device.queue.submit([commandEncoder.finish()])
    }
}
