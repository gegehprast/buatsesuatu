import shader from './shaders/shaders.wgsl?raw'
import { Triangle as TriangleMesh } from '../meshes/Triangle'
import { mat4 } from 'gl-matrix'
import { Material } from './Material'
import { Camera } from '../models/Camera'
import { Triangle } from '../models/Triangle'

export class Renderer {
    private canvas: HTMLCanvasElement

    private adapter!: GPUAdapter
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private format!: GPUTextureFormat

    private uniformBuffer!: GPUBuffer
    private bindGroup!: GPUBindGroup
    private pipeline!: GPURenderPipeline

    private triangleMesh!: TriangleMesh
    private material!: Material

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.render = this.render.bind(this)
    }

    async initialize() {
        await this.setupDevice()

        await this.createAssets()

        await this.makePipeline()
    }

    private async setupDevice() {
        if (!navigator.gpu) throw Error('WebGPU not supported.')

        const adapter = await navigator.gpu.requestAdapter({
            featureLevel: 'compatibility',
        })

        if (!adapter) throw Error("Couldn't request WebGPU adapter.")

        const device = await adapter.requestDevice()

        const devicePixelRatio = window.devicePixelRatio
        this.canvas.width = this.canvas.clientWidth * devicePixelRatio
        this.canvas.height = this.canvas.clientHeight * devicePixelRatio

        const context = this.canvas.getContext('webgpu')

        if (!context) throw Error("Couldn't get WebGPU context.")

        this.adapter = adapter
        this.device = device
        this.context = context

        this.format = navigator.gpu.getPreferredCanvasFormat()

        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: 'opaque',
        })
    }

    private async createAssets() {
        this.triangleMesh = new TriangleMesh(this.device)
        this.material = new Material()

        await this.material.initialize(this.device, '/oiia.png')
    }

    private async makePipeline() {
        this.uniformBuffer = this.device.createBuffer({
            size: 4 * 16 * 3,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {},
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {},
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {},
                },
            ],
        })

        this.bindGroup = this.device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: this.material.view,
                },
                {
                    binding: 2,
                    resource: this.material.sampler,
                },
            ],
        })

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        })

        this.pipeline = this.device.createRenderPipeline({
            vertex: {
                module: this.device.createShaderModule({
                    code: shader,
                }),
                entryPoint: 'vert_main',
                buffers: [this.triangleMesh.bufferLayout],
            },
            fragment: {
                module: this.device.createShaderModule({
                    code: shader,
                }),
                entryPoint: 'frag_main',
                targets: [
                    {
                        format: this.format,
                    },
                ],
            },
            primitive: {
                topology: 'triangle-list',
            },
            layout: pipelineLayout,
        })
    }

    async render(camera: Camera, triangles: Triangle[]) {
        const view = camera.getView()

        const projection = mat4.create()
        mat4.perspective(
            projection,
            Math.PI / 4,
            this.canvas.width / this.canvas.height,
            0.1,
            100.0,
        )

        this.device.queue.writeBuffer(
            this.uniformBuffer,
            64 * 1,
            <ArrayBuffer>view,
        )
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            64 * 2,
            <ArrayBuffer>projection,
        )

        const commandEncoder = this.device.createCommandEncoder()
        const textureView = this.context.getCurrentTexture().createView()
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.5, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
        }
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)

        passEncoder.setPipeline(this.pipeline)
        passEncoder.setVertexBuffer(0, this.triangleMesh.buffer)

        triangles.forEach((triangle) => {
            const model = triangle.getModel()

            this.device.queue.writeBuffer(
                this.uniformBuffer,
                0,
                <ArrayBuffer>model,
            )

            passEncoder.setBindGroup(0, this.bindGroup)
            passEncoder.draw(3, 1, 0, 0)
        })

        passEncoder.end()

        this.device.queue.submit([commandEncoder.finish()])
    }
}
