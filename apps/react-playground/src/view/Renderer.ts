import shader from './shaders/shaders.wgsl?raw'
import { Triangle as TriangleMesh } from '../meshes/Triangle'
import { Quad as QuadMesh } from '../meshes/Quad'
import { mat4 } from 'gl-matrix'
import { Material } from './Material'
import { OBJECT_TYPES, RenderData } from '../models/definitions'

export class Renderer {
    private canvas: HTMLCanvasElement

    private adapter!: GPUAdapter
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private format!: GPUTextureFormat

    private uniformBuffer!: GPUBuffer
    private triangleBindGroup!: GPUBindGroup
    private quadBindGroup!: GPUBindGroup
    private pipeline!: GPURenderPipeline

    depthStencilState!: GPUDepthStencilState
    depthStencilBuffer!: GPUTexture
    depthStencilView!: GPUTextureView
    depthStencilAttachment!: GPURenderPassDepthStencilAttachment

    private triangleMesh!: TriangleMesh
    private quadMesh!: QuadMesh
    private triangleMaterial!: Material
    private quadMaterial!: Material
    private objectBuffer!: GPUBuffer

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.render = this.render.bind(this)
    }

    async initialize() {
        await this.setupDevice()

        await this.createAssets()

        await this.makeDepthBufferResources()

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

    private async makeDepthBufferResources() {
        this.depthStencilState = {
            format: 'depth24plus-stencil8',
            depthWriteEnabled: true,
            depthCompare: 'less-equal',
        }

        const size: GPUExtent3D = {
            width: this.canvas.width,
            height: this.canvas.height,
            depthOrArrayLayers: 1,
        }
        const depthBufferDescriptor: GPUTextureDescriptor = {
            size,
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        }
        this.depthStencilBuffer = this.device.createTexture(depthBufferDescriptor)

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: 'depth24plus-stencil8',
            dimension: '2d',
            aspect: 'all',
        }
        this.depthStencilView = this.depthStencilBuffer.createView(viewDescriptor)

        this.depthStencilAttachment = {
            view: this.depthStencilView,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilLoadOp: 'clear',
            stencilStoreOp: 'discard',
        }
    }

    private async createAssets() {
        this.triangleMesh = new TriangleMesh(this.device)
        this.triangleMaterial = new Material()
        this.quadMesh = new QuadMesh(this.device)
        this.quadMaterial = new Material()

        const modelBufferDescriptor: GPUBufferDescriptor = {
            size: 4 * 16 * 1024,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }
        this.objectBuffer = this.device.createBuffer(modelBufferDescriptor)

        await this.triangleMaterial.initialize(this.device, '/oiia.png')
        await this.quadMaterial.initialize(this.device, '/floor.png')
    }

    private async makePipeline() {
        this.uniformBuffer = this.device.createBuffer({
            size: 4 * 16 * 2,
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
                {
                    binding: 3,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: {
                        type: 'read-only-storage',
                        hasDynamicOffset: false,
                    },
                },
            ],
        })

        this.triangleBindGroup = this.device.createBindGroup({
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
                    resource: this.triangleMaterial.view,
                },
                {
                    binding: 2,
                    resource: this.triangleMaterial.sampler,
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.objectBuffer,
                    },
                },
            ],
        })

        this.quadBindGroup = this.device.createBindGroup({
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
                    resource: this.quadMaterial.view,
                },
                {
                    binding: 2,
                    resource: this.quadMaterial.sampler,
                },
                {
                    binding: 3,
                    resource: {
                        buffer: this.objectBuffer,
                    },
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
            depthStencil: this.depthStencilState,
        })
    }

    render(renderables: RenderData) {
        const view = renderables.view_transform

        const projection = mat4.create()
        mat4.perspective(
            projection,
            Math.PI / 4,
            this.canvas.width / this.canvas.height,
            0.1,
            10.0,
        )

        this.device.queue.writeBuffer(
            this.objectBuffer,
            0,
            renderables.model_transforms,
            0,
            renderables.model_transforms.length,
        )
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            0,
            <ArrayBuffer>view,
        )
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            64,
            <ArrayBuffer>projection,
        )

        const commandEncoder = this.device.createCommandEncoder()
        const textureView = this.context.getCurrentTexture().createView()
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.67, g: 0.84, b: 0.90, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: this.depthStencilAttachment,
        }
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)

        passEncoder.setPipeline(this.pipeline)

        let objectsDrawn = 0

        passEncoder.setVertexBuffer(0, this.triangleMesh.buffer)
        passEncoder.setBindGroup(0, this.triangleBindGroup)
        passEncoder.draw(3, renderables.object_counts[OBJECT_TYPES.TRIANGLE], 0, objectsDrawn)
        objectsDrawn += renderables.object_counts[OBJECT_TYPES.TRIANGLE]

        passEncoder.setVertexBuffer(0, this.quadMesh.buffer)
        passEncoder.setBindGroup(0, this.quadBindGroup)
        passEncoder.draw(6, renderables.object_counts[OBJECT_TYPES.QUAD], 0, objectsDrawn)
        objectsDrawn += renderables.object_counts[OBJECT_TYPES.QUAD]
        
        passEncoder.end()

        this.device.queue.submit([commandEncoder.finish()])
    }
}
