import { BindGroup } from '../BindGroup'
import { Pipeline } from '../Pipeline'
import { Renderable } from '../Interfaces/Renderable'
import shader from '../shaders.wgsl?raw'

export class QuadMesh implements Renderable {
    public label = 'QuadMesh'

    public device?: GPUDevice

    public context?: GPUCanvasContext

    public pipeline?: Pipeline

    public mainBindGroup?: BindGroup

    public vertexBuffer?: GPUBuffer

    public vertexBufferLayout?: GPUVertexBufferLayout

    // prettier-ignore
    public vertices: Float32Array = new Float32Array([
        -0.5, -0.5, 0.0, 1.0, 0.0, 0.0,
        0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
        -0.5, 0.5, 0.0, 1.0, 1.0, 0.0,
        0.5, 0.5, 0.0, 0.0, 0.0, 1.0,
    ])
    public indices: Uint32Array = new Uint32Array([
        0, 1, 2,
        1, 3, 2,
    ])
    public indexBuffer?: GPUBuffer

    public init(
        device: GPUDevice,
        context: GPUCanvasContext,
        mainBindGroup: BindGroup,
    ) {
        this.device = device
        this.context = context
        this.mainBindGroup = mainBindGroup
        this.pipeline = new Pipeline(device, this.label)
    }

    public build() {
        if (!this.device) {
            throw new Error('Device is not initialized')
        }

        // create the buffer
        this.vertexBuffer = this.device.createBuffer({
            size: this.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        })

        // copy the vertices into the buffer
        new Float32Array(this.vertexBuffer.getMappedRange()).set(this.vertices)
        this.vertexBuffer.unmap()
        
        // create the index buffer
        this.indexBuffer = this.device.createBuffer({
            size: this.indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        })

        // copy the indices into the buffer
        new Uint32Array(this.indexBuffer.getMappedRange()).set(this.indices)
        this.indexBuffer.unmap()

        // set the buffer layout
        this.vertexBufferLayout = {
            arrayStride: 4 * (3 + 3),
            attributes: [
                {
                    shaderLocation: 0,
                    format: 'float32x3',
                    offset: 0,
                },
                {
                    shaderLocation: 1,
                    format: 'float32x3',
                    offset: 4 * 3,
                },
            ],
        }

        // build the pipeline
        this.buildPipeline()
    }

    public buildPipeline() {
        if (!this.pipeline) throw Error('Pipeline not initialized.')

        if (!this.mainBindGroup) throw Error('Main bind group not initialized.')

        this.pipeline.addVertexBufferLayout(this.vertexBufferLayout)
        this.pipeline.setVertexShader(shader, 'vert_main')
        this.pipeline.setFragmentShader(shader, 'frag_main')
        this.pipeline.addBindGroupLayout(this.mainBindGroup.getLayout())
        this.pipeline.build()
    }

    public render(passEncoder: GPURenderPassEncoder, index: number) {
        if (!this.pipeline) throw Error('Pipeline not initialized.')

        if (!this.mainBindGroup) throw Error('Main bind group not initialized.')

        passEncoder.setPipeline(this.pipeline.get())
        passEncoder.setBindGroup(0, this.mainBindGroup.get())
        passEncoder.setVertexBuffer(0, this.vertexBuffer)
        passEncoder.setIndexBuffer(this.indexBuffer!, 'uint32')
        passEncoder.drawIndexed(6, 1, 0, 0, index)
    }
}
