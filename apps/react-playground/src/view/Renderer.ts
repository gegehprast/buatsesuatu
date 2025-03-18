import shader from './shaders/shaders.wgsl?raw'
import sky_shader from './shaders/sky_shader.wgsl?raw'
import { Triangle as TriangleMesh } from '../meshes/Triangle'
import { Quad as QuadMesh } from '../meshes/Quad'
import { mat4 } from 'gl-matrix'
import { Material } from './Material'
import { OBJECT_TYPES, PIPELINE_TYPES, RenderData } from '../models/definitions'
import { ObjectMesh } from '../meshes/ObjectMesh'
import oiia from '@/assets/oiia.png'
import floor from '@/assets/floor.jpg'
import sky_back from '@/assets/sky_back.png' 
import sky_front from '@/assets/sky_front.png' 
import sky_left from '@/assets/sky_left.png' 
import sky_right from '@/assets/sky_right.png' 
import sky_top from '@/assets/sky_top.png' 
import sky_bottom from '@/assets/sky_bottom.png' 
import statue from '@/assets/statue.obj?raw'
import { CubeMapMaterial } from './CubeMapMaterial'
import { Camera } from '../models/Camera'

export class Renderer {
    private canvas: HTMLCanvasElement

    private adapter!: GPUAdapter
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private format!: GPUTextureFormat

    private uniformBuffer!: GPUBuffer
    private pipelines: {
        [pipeline in PIPELINE_TYPES]: GPURenderPipeline | null
    }
    private frameGroupLayouts!: {
        [pipeline in PIPELINE_TYPES]: GPUBindGroupLayout | null
    }
    private materialGroupLayout!: GPUBindGroupLayout
    private frameBindGroups: {
        [pipeline in PIPELINE_TYPES]: GPUBindGroup | null
    }

    depthStencilState!: GPUDepthStencilState
    depthStencilBuffer!: GPUTexture
    depthStencilView!: GPUTextureView
    depthStencilAttachment!: GPURenderPassDepthStencilAttachment

    private triangleMesh!: TriangleMesh
    private quadMesh!: QuadMesh
    private statueMesh!: ObjectMesh
    private triangleMaterial!: Material
    private quadMaterial!: Material
    private skyMaterial!: CubeMapMaterial

    private objectBuffer!: GPUBuffer
    parameterBuffer!: GPUBuffer

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.pipelines = {
            [PIPELINE_TYPES.SKY]: null,
            [PIPELINE_TYPES.STANDARD]: null,
        }

        this.frameBindGroups = {
            [PIPELINE_TYPES.SKY]: null,
            [PIPELINE_TYPES.STANDARD]: null,
        }

        this.render = this.render.bind(this)
    }

    async initialize() {
        await this.setupDevice()

        await this.makeBindGroupLayouts()

        await this.createAssets()

        await this.makeDepthBufferResources()

        await this.makePipeline()

        await this.makeBindGroups()
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

    private async makeBindGroupLayouts() {
        this.frameGroupLayouts = {
            [PIPELINE_TYPES.SKY]: null,
            [PIPELINE_TYPES.STANDARD]: null,
        }

        this.frameGroupLayouts[PIPELINE_TYPES.SKY] =
            this.device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.VERTEX,
                        buffer: {
                            type: 'uniform',
                        },
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: {
                            viewDimension: 'cube',
                        },
                    },
                    {
                        binding: 2,
                        visibility: GPUShaderStage.FRAGMENT,
                        sampler: {},
                    },
                ],
            })

        this.frameGroupLayouts[PIPELINE_TYPES.STANDARD] =
            this.device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.VERTEX,
                        buffer: {},
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.VERTEX,
                        buffer: {
                            type: 'read-only-storage',
                            hasDynamicOffset: false,
                        },
                    },
                ],
            })

        this.materialGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.FRAGMENT,
                    texture: {},
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    sampler: {},
                },
            ],
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
        this.depthStencilBuffer = this.device.createTexture(
            depthBufferDescriptor,
        )

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: 'depth24plus-stencil8',
            dimension: '2d',
            aspect: 'all',
        }
        this.depthStencilView =
            this.depthStencilBuffer.createView(viewDescriptor)

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
        this.uniformBuffer = this.device.createBuffer({
            size: 4 * 16 * 2,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        const modelBufferDescriptor: GPUBufferDescriptor = {
            size: 4 * 16 * 1024,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }
        this.objectBuffer = this.device.createBuffer(modelBufferDescriptor)

        const parameterBufferDescriptor: GPUBufferDescriptor = {
            size: 48,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        }
        this.parameterBuffer = this.device.createBuffer(
            parameterBufferDescriptor,
        )

        this.triangleMesh = new TriangleMesh(this.device)
        this.triangleMaterial = new Material()
        this.quadMesh = new QuadMesh(this.device)
        this.quadMaterial = new Material()
        this.statueMesh = new ObjectMesh()
        this.skyMaterial = new CubeMapMaterial()

        await this.triangleMaterial.initialize(
            this.device,
            oiia,
            this.materialGroupLayout,
        )

        await this.quadMaterial.initialize(
            this.device,
            floor,
            this.materialGroupLayout,
        )

        await this.statueMesh.initialize(this.device, statue)

        const urls = [
            sky_back, //x+
            sky_front, //x-
            sky_left, //y+
            sky_right, //y-
            sky_top, //z+
            sky_bottom, //z-
        ]
        await this.skyMaterial.initialize(this.device, urls)
    }

    private async makePipeline() {
        const standardPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                // prettier-ignore
                this.frameGroupLayouts[PIPELINE_TYPES.STANDARD] as GPUBindGroupLayout,
                this.materialGroupLayout,
            ],
        })

        this.pipelines[PIPELINE_TYPES.STANDARD] =
            this.device.createRenderPipeline({
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
                layout: standardPipelineLayout,
                depthStencil: this.depthStencilState,
            })

        const skyPipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [
                this.frameGroupLayouts[
                    PIPELINE_TYPES.SKY
                ] as GPUBindGroupLayout,
            ],
        })
        this.pipelines[PIPELINE_TYPES.SKY] = this.device.createRenderPipeline({
            vertex: {
                module: this.device.createShaderModule({
                    code: sky_shader,
                }),
                entryPoint: 'sky_vert_main',
            },

            fragment: {
                module: this.device.createShaderModule({
                    code: sky_shader,
                }),
                entryPoint: 'sky_frag_main',
                targets: [
                    {
                        format: this.format,
                    },
                ],
            },

            primitive: {
                topology: 'triangle-list',
            },

            layout: skyPipelineLayout,
            depthStencil: this.depthStencilState,
        })
    }

    private async makeBindGroups() {
        this.frameBindGroups[PIPELINE_TYPES.STANDARD] =
            this.device.createBindGroup({
                layout: this.frameGroupLayouts[
                    PIPELINE_TYPES.STANDARD
                ] as GPUBindGroupLayout,
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: this.uniformBuffer,
                        },
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer: this.objectBuffer,
                        },
                    },
                ],
            })

        this.frameBindGroups[PIPELINE_TYPES.SKY] = this.device.createBindGroup({
            layout: this.frameGroupLayouts[
                PIPELINE_TYPES.SKY
            ] as GPUBindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.parameterBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: this.skyMaterial.view,
                },
                {
                    binding: 2,
                    resource: this.skyMaterial.sampler,
                },
            ],
        })
    }

    private prepareScene(renderables: RenderData, camera: Camera) {
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
        this.device.queue.writeBuffer(this.uniformBuffer, 0, <ArrayBuffer>view)
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            64,
            <ArrayBuffer>projection,
        )

        const dy = Math.tan(Math.PI / 8)
        const dx = (dy * 800) / 600

        this.device.queue.writeBuffer(
            this.parameterBuffer,
            0,
            new Float32Array([
                camera.forwards[0],
                camera.forwards[1],
                camera.forwards[2],
                0.0,
                dx * camera.right[0],
                dx * camera.right[1],
                dx * camera.right[2],
                0.0,
                dy * camera.up[0],
                dy * camera.up[1],
                dy * camera.up[2],
                0.0,
            ]),
            0,
            12,
        )
    }

    render(renderables: RenderData, camera: Camera) {
        this.prepareScene(renderables, camera)

        const commandEncoder = this.device.createCommandEncoder()
        const textureView = this.context.getCurrentTexture().createView()
        const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.67, g: 0.84, b: 0.9, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            depthStencilAttachment: this.depthStencilAttachment,
        }
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)

        passEncoder.setPipeline(
            this.pipelines[PIPELINE_TYPES.SKY] as GPURenderPipeline,
        )
        passEncoder.setBindGroup(0, this.frameBindGroups[PIPELINE_TYPES.SKY])
        passEncoder.setBindGroup(1, this.quadMaterial.bindGroup)
        passEncoder.draw(6, 1, 0, 0)

        passEncoder.setPipeline(
            this.pipelines[PIPELINE_TYPES.STANDARD] as GPURenderPipeline,
        )
        passEncoder.setBindGroup(
            0,
            this.frameBindGroups[PIPELINE_TYPES.STANDARD],
        )

        let objectsDrawn = 0

        passEncoder.setVertexBuffer(0, this.triangleMesh.buffer)
        passEncoder.setBindGroup(1, this.triangleMaterial.bindGroup)
        passEncoder.draw(
            3,
            renderables.object_counts[OBJECT_TYPES.TRIANGLE],
            0,
            objectsDrawn,
        )
        objectsDrawn += renderables.object_counts[OBJECT_TYPES.TRIANGLE]

        passEncoder.setVertexBuffer(0, this.quadMesh.buffer)
        passEncoder.setBindGroup(1, this.quadMaterial.bindGroup)
        passEncoder.draw(
            6,
            renderables.object_counts[OBJECT_TYPES.QUAD],
            0,
            objectsDrawn,
        )
        objectsDrawn += renderables.object_counts[OBJECT_TYPES.QUAD]

        passEncoder.setVertexBuffer(0, this.statueMesh.buffer)
        passEncoder.setBindGroup(1, this.triangleMaterial.bindGroup)
        passEncoder.draw(this.statueMesh.vertexCount, 1, 0, objectsDrawn)
        objectsDrawn += 1

        passEncoder.end()

        this.device.queue.submit([commandEncoder.finish()])
    }
}
