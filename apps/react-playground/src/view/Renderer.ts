import shader from './shaders/shaders.wgsl?raw'
import sky_shader from './shaders/sky_shader.wgsl?raw'
import post_shader from './shaders/post.wgsl?raw'
import screen_shader from './shaders/screen.wgsl?raw'
import gun_shader from './shaders/gun.wgsl?raw'
import { Triangle as TriangleMesh } from '../meshes/Triangle'
import { Quad as QuadMesh } from '../meshes/Quad'
import { mat4, vec3 } from 'gl-matrix'
import { Material } from './Material'
import { OBJECT_TYPES, PIPELINE_TYPES, RenderData } from '../models/definitions'
import { ObjectMesh } from '../meshes/ObjectMesh'
import sky_back from '@/assets/sky_back.png'
import sky_front from '@/assets/sky_front.png'
import sky_left from '@/assets/sky_left.png'
import sky_right from '@/assets/sky_right.png'
import sky_top from '@/assets/sky_top.png'
import sky_bottom from '@/assets/sky_bottom.png'
import statue from '@/assets/statue.obj?raw'
import gun from '@/assets/gun.obj?raw'
import { CubeMapMaterial } from './CubeMapMaterial'
import { Camera } from '../models/Camera'
import { BindGroupLayoutBuilder } from './BindGroupLayoutBuilder'
import { RenderPipelineBuilder } from './RenderPipelineBuilder'
import { BindGroupBuilder } from './BindGroupBuilder'
import { Framebuffer } from './Framebuffer'
import { degToRad } from '../models/math'

export class Renderer {
    private canvas: HTMLCanvasElement

    private adapter!: GPUAdapter
    private device!: GPUDevice
    private context!: GPUCanvasContext
    private format: GPUTextureFormat

    private uniformBuffer!: GPUBuffer
    private pipelines: {
        [pipeline in PIPELINE_TYPES]: GPURenderPipeline | null
    }
    private frameGroupLayouts: {
        [pipeline in PIPELINE_TYPES]: GPUBindGroupLayout | null
    }
    private materialGroupLayout!: GPUBindGroupLayout
    private frameBindGroups: {
        [pipeline in PIPELINE_TYPES]: GPUBindGroup | null
    }

    private triangleMesh!: TriangleMesh
    private quadMesh!: QuadMesh
    private statueMesh!: ObjectMesh
    private triangleMaterial!: Material
    private quadMaterial!: Material
    private skyMaterial!: CubeMapMaterial
    private hudMaterial!: Material

    private framebuffer: Framebuffer
    private gunFrameBuffer: Framebuffer
    private gunMesh!: ObjectMesh
    private gunMaterial!: Material

    private timeBuffer!: GPUBuffer

    private objectBuffer!: GPUBuffer
    private parameterBuffer!: GPUBuffer

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas

        this.format = navigator.gpu.getPreferredCanvasFormat()

        this.pipelines = {
            [PIPELINE_TYPES.SKY]: null,
            [PIPELINE_TYPES.STANDARD]: null,
            [PIPELINE_TYPES.POST]: null,
            [PIPELINE_TYPES.HUD]: null,
            [PIPELINE_TYPES.GUN]: null,
        }

        this.frameBindGroups = {
            [PIPELINE_TYPES.SKY]: null,
            [PIPELINE_TYPES.STANDARD]: null,
            [PIPELINE_TYPES.POST]: null,
            [PIPELINE_TYPES.HUD]: null,
            [PIPELINE_TYPES.GUN]: null,
        }

        this.frameGroupLayouts = {
            [PIPELINE_TYPES.SKY]: null,
            [PIPELINE_TYPES.STANDARD]: null,
            [PIPELINE_TYPES.POST]: null,
            [PIPELINE_TYPES.HUD]: null,
            [PIPELINE_TYPES.GUN]: null,
        }

        this.framebuffer = new Framebuffer('World Layer')
        this.gunFrameBuffer = new Framebuffer('Gun Layer')

        this.render = this.render.bind(this)
    }

    public async initialize() {
        await this.setupDevice()

        this.makeBindGroupLayouts()

        await this.createAssets()

        this.makePipelines()

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

        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: 'opaque',
        })
    }

    private makeBindGroupLayouts() {
        const builder = new BindGroupLayoutBuilder(this.device)

        builder.addBuffer(GPUShaderStage.VERTEX, 'uniform')
        builder.addMaterial(GPUShaderStage.FRAGMENT, 'cube')
        this.frameGroupLayouts[PIPELINE_TYPES.SKY] = builder.build('bgl-sky')

        builder.addBuffer(GPUShaderStage.VERTEX, 'uniform')
        builder.addBuffer(GPUShaderStage.VERTEX, 'read-only-storage')
        this.frameGroupLayouts[PIPELINE_TYPES.STANDARD] =
            builder.build('bgl-standard')

        builder.addBuffer(GPUShaderStage.VERTEX, 'uniform')
        builder.addBuffer(GPUShaderStage.FRAGMENT, 'uniform')
        builder.addMaterial(GPUShaderStage.FRAGMENT, '2d', 'filtering')
        this.frameGroupLayouts[PIPELINE_TYPES.POST] = builder.build('bgl-post')

        builder.addMaterial(GPUShaderStage.FRAGMENT, '2d')
        this.materialGroupLayout = builder.build('bgl-material')

        builder.addMaterial(GPUShaderStage.FRAGMENT, '2d')
        this.frameGroupLayouts[PIPELINE_TYPES.HUD] = builder.build('bgl-hud')

        builder.addBuffer(GPUShaderStage.VERTEX, 'uniform')
        this.frameGroupLayouts[PIPELINE_TYPES.GUN] = builder.build('bgl-gun')
    }

    private async createAssets() {
        this.timeBuffer = this.device.createBuffer({
            size: 4, // size of float32
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        // the size corresponds to the buffer data written on prepareScene() for view and projection matrices
        this.uniformBuffer = this.device.createBuffer({
            size: 4 * 16 * 2,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        // the size corresponds to the number of objects that can be rendered
        // each object is represented by a 4x4 matrix, which is 64 bytes of data
        // the total size is 64 * 1024 = 65536 bytes (for storing transformation matrices of 1024 objects)
        this.objectBuffer = this.device.createBuffer({
            size: 4 * 16 * 1024,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })

        // the size corresponds to the buffer data written on prepareScene() for camera parameters
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

        // triangle materials
        await this.triangleMaterial.initialize(
            this.device,
            'oiia',
            'png',
            6,
            this.materialGroupLayout,
            'bg-triangles',
        )

        // floor material
        await this.quadMaterial.initialize(
            this.device,
            'floor',
            'png',
            6,
            this.materialGroupLayout,
            'bg-floor',
        )

        // statue mesh
        await this.statueMesh.initialize(this.device, statue, true, true, false, mat4.create())

        // sky box material
        const urls = [
            sky_back, //x+
            sky_front, //x-
            sky_left, //y+
            sky_right, //y-
            sky_top, //z+
            sky_bottom, //z-
        ]
        await this.skyMaterial.initialize(this.device, urls)

        // framebuffer (world (post processing))
        await this.framebuffer.initialize(
            this.device,
            this.canvas,
            this.frameGroupLayouts[PIPELINE_TYPES.POST] as GPUBindGroupLayout,
            this.format,
            true,
            this.timeBuffer,
        )

        // framebuffer (gun)
        await this.gunFrameBuffer.initialize(
            this.device,
            this.canvas,
            this.frameGroupLayouts[PIPELINE_TYPES.POST] as GPUBindGroupLayout,
            this.format,
            true,
            this.timeBuffer,
        )

        // HUD material
        this.hudMaterial = new Material()
        await this.hudMaterial.initialize(
            this.device,
            'hud',
            'png',
            1,
            this.materialGroupLayout,
            'bg-hud',
        )

        // GUN
        const rotation = mat4.create()
        mat4.fromYRotation(rotation, degToRad(180))

        const translate = mat4.create()
        mat4.fromTranslation(translate, vec3.fromValues(-0.4, -0.9, 2.5))

        const scale = mat4.create()
        mat4.fromScaling(scale, vec3.fromValues(0.25, 0.25, 0.25))

        const preTransform = mat4.create()
        mat4.multiply(preTransform, preTransform, rotation)
        mat4.multiply(preTransform, preTransform, translate)
        mat4.multiply(preTransform, preTransform, scale)

        this.gunMesh = new ObjectMesh()
        await this.gunMesh.initialize(this.device, gun, true, true, true, preTransform)

        this.gunMaterial = new Material()
        await this.gunMaterial.initialize(
            this.device,
            'gun',
            'png',
            1,
            this.materialGroupLayout,
            'bg-gun',
        )
    }

    private makePipelines() {
        const builder: RenderPipelineBuilder = new RenderPipelineBuilder(
            this.device,
        )

        // sky
        builder.addBindGroupLayout(
            this.frameGroupLayouts[PIPELINE_TYPES.SKY] as GPUBindGroupLayout,
        )
        builder.setSourceCode(sky_shader, 'sky_vert_main', 'sky_frag_main')
        builder.addRenderTarget(this.format)
        builder.setDepthStencilState(this.framebuffer.depthStencilState)
        this.pipelines[PIPELINE_TYPES.SKY] = builder.build('pl-sky')

        // standard
        builder.addBindGroupLayout(
            this.frameGroupLayouts[
                PIPELINE_TYPES.STANDARD
            ] as GPUBindGroupLayout,
        )
        builder.addBindGroupLayout(this.materialGroupLayout)
        builder.setSourceCode(shader, 'vert_main', 'frag_main')
        builder.addVertexBufferDescription(this.triangleMesh.bufferLayout)
        builder.addRenderTarget(this.format)
        builder.setDepthStencilState(this.framebuffer.depthStencilState)
        this.pipelines[PIPELINE_TYPES.STANDARD] = builder.build('pl-standard')

        // post processing
        builder.addBindGroupLayout(
            this.frameGroupLayouts[PIPELINE_TYPES.POST] as GPUBindGroupLayout,
        )
        builder.setSourceCode(post_shader, 'vert_main', 'frag_main')
        builder.addRenderTarget(this.format)
        this.pipelines[PIPELINE_TYPES.POST] = builder.build('pl-post')

        // HUD
        builder.addBindGroupLayout(
            this.frameGroupLayouts[PIPELINE_TYPES.HUD] as GPUBindGroupLayout,
        )
        builder.setSourceCode(screen_shader, 'vert_main', 'frag_main')
        builder.setBlendState(true)
        builder.addRenderTarget(this.format)
        this.pipelines[PIPELINE_TYPES.HUD] = builder.build('pl-hud')

        // gun
        builder.addBindGroupLayout(
            this.frameGroupLayouts[PIPELINE_TYPES.GUN] as GPUBindGroupLayout,
        )
        builder.addBindGroupLayout(this.materialGroupLayout)
        builder.setSourceCode(gun_shader, 'vert_main', 'frag_main')
        builder.addVertexBufferDescription(this.gunMesh.bufferLayout)
        builder.addRenderTarget(this.format)
        builder.setDepthStencilState(this.gunFrameBuffer.depthStencilState)
        this.pipelines[PIPELINE_TYPES.GUN] = builder.build('pl-gun')
    }

    private async makeBindGroups() {
        const builder: BindGroupBuilder = new BindGroupBuilder(this.device)

        builder.setLayout(
            this.frameGroupLayouts[
                PIPELINE_TYPES.STANDARD
            ] as GPUBindGroupLayout,
        )
        builder.addBuffer(this.uniformBuffer)
        builder.addBuffer(this.objectBuffer)
        this.frameBindGroups[PIPELINE_TYPES.STANDARD] =
            builder.build('bg-standard')

        builder.setLayout(
            this.frameGroupLayouts[PIPELINE_TYPES.SKY] as GPUBindGroupLayout,
        )
        builder.addBuffer(this.parameterBuffer)
        builder.addMaterial(this.skyMaterial.view, this.skyMaterial.sampler)
        this.frameBindGroups[PIPELINE_TYPES.SKY] = builder.build('bg-sky')

        builder.setLayout(
            this.frameGroupLayouts[PIPELINE_TYPES.GUN] as GPUBindGroupLayout,
        )
        builder.addBuffer(this.uniformBuffer)
        this.frameBindGroups[PIPELINE_TYPES.GUN] = builder.build('bg-gun')
    }

    private prepareScene(renderables: RenderData, camera: Camera) {
        this.device.queue.writeBuffer(
            this.timeBuffer,
            0,
            new Float32Array([performance.now() / 1000]),
        )
        
        // 64 bytes of data
        this.device.queue.writeBuffer(
            this.objectBuffer,
            0,
            renderables.model_transforms,
            0,
            renderables.model_transforms.length,
        )

        const view = renderables.view_transform

        // View matrix write 64 bytes of data
        this.device.queue.writeBuffer(this.uniformBuffer, 0, <ArrayBuffer>view)

        const projection = mat4.create()
        mat4.perspective(
            projection,
            Math.PI / 4,
            this.canvas.width / this.canvas.height,
            0.1,
            10.0,
        )

        // Projection matrix write 64 bytes of data
        this.device.queue.writeBuffer(
            this.uniformBuffer,
            64, // 64 bytes offset
            <ArrayBuffer>projection,
        )

        const dy = Math.tan(Math.PI / 8)
        const dx = (dy * this.canvas.width) / this.canvas.height

        // Camera parameters write 48 bytes of data
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

    public drawWorld(
        renderables: RenderData,
        camera: Camera,
        commandEncoder: GPUCommandEncoder,
    ) {
        this.prepareScene(renderables, camera)

        const passEncoder = this.framebuffer.renderTo(commandEncoder)

        // sky box
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

        // triangles
        passEncoder.setVertexBuffer(0, this.triangleMesh.buffer)
        passEncoder.setBindGroup(1, this.triangleMaterial.bindGroup)
        passEncoder.draw(
            3,
            renderables.object_counts[OBJECT_TYPES.TRIANGLE],
            0,
            objectsDrawn,
        )
        objectsDrawn += renderables.object_counts[OBJECT_TYPES.TRIANGLE]

        // floor
        passEncoder.setVertexBuffer(0, this.quadMesh.buffer)
        passEncoder.setBindGroup(1, this.quadMaterial.bindGroup)
        passEncoder.draw(
            6,
            renderables.object_counts[OBJECT_TYPES.QUAD],
            0,
            objectsDrawn,
        )
        objectsDrawn += renderables.object_counts[OBJECT_TYPES.QUAD]

        // statue
        passEncoder.setVertexBuffer(0, this.statueMesh.buffer)
        passEncoder.setBindGroup(1, this.triangleMaterial.bindGroup)
        passEncoder.draw(this.statueMesh.vertexCount, 1, 0, objectsDrawn)
        objectsDrawn += 1

        passEncoder.end()
    }

    public drawGun(
        commandEncoder: GPUCommandEncoder,
    ) {
        const passEncoder = this.gunFrameBuffer.renderTo(commandEncoder)
        
        passEncoder.setPipeline(
            this.pipelines[PIPELINE_TYPES.GUN] as GPURenderPipeline,
        )
        passEncoder.setBindGroup(0, this.frameBindGroups[PIPELINE_TYPES.GUN])
        passEncoder.setBindGroup(1, this.gunMaterial.bindGroup)
        passEncoder.setVertexBuffer(0, this.gunMesh.buffer)
        passEncoder.draw(this.gunMesh.vertexCount, 1, 0, 0)

        passEncoder.end()
    }

    public drawScreen(commandEncoder: GPUCommandEncoder) {
        const textureView = this.context.getCurrentTexture().createView({
            label: 'textureView',
        })
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    loadOp: 'clear',
                    storeOp: 'store',
                    clearValue: { r: 0.1, g: 0.2, b: 0.4, a: 1.0 },
                },
            ],
            label: 'drawScreen',
        })

        // post processing
        passEncoder.setPipeline(
            this.pipelines[PIPELINE_TYPES.POST] as GPURenderPipeline,
        )
        this.framebuffer.readFrom(passEncoder, 0)
        passEncoder.draw(6, 1, 0, 0)

        passEncoder.setPipeline(
            this.pipelines[PIPELINE_TYPES.POST] as GPURenderPipeline,
        )
        this.gunFrameBuffer.readFrom(passEncoder, 0)
        passEncoder.draw(6, 1, 0, 0)

        // HUD
        passEncoder.setPipeline(
            this.pipelines[PIPELINE_TYPES.HUD] as GPURenderPipeline,
        )
        passEncoder.setBindGroup(0, this.hudMaterial.bindGroup)
        passEncoder.draw(6, 1, 0, 0)

        passEncoder.end()
    }

    public render(renderables: RenderData, camera: Camera) {
        const commandEncoder = this.device.createCommandEncoder({
            label: 'render pass',
        })

        this.drawWorld(renderables, camera, commandEncoder)
        this.drawGun(commandEncoder)
        this.drawScreen(commandEncoder)

        this.device.queue.submit([commandEncoder.finish()])
    }
}
