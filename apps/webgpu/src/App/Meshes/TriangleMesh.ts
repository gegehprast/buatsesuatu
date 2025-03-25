import { BindGroup } from '../BindGroup'
import { Pipeline } from '../Pipeline'
import { Renderable } from '../Interfaces/Renderable'
import shader from '../shaders.wgsl?raw'

export class TriangleMesh implements Renderable {
    public label = 'TriangleMesh'

    public device?: GPUDevice

    public context?: GPUCanvasContext

    public pipeline?: Pipeline

    public mainBindGroup?: BindGroup

    public buffer?: GPUBuffer

    public bufferLayout?: GPUVertexBufferLayout

    // prettier-ignore
    public vertices: Float32Array = new Float32Array([
        0.0, 0.5, 0.0, 1.0, 0.0, 0.0,
        -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
        0.5, -0.5, 0.0, 0.0, 0.0, 1.0,
    ])

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
        this.buffer = this.device.createBuffer({
            size: this.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        })

        // copy the vertices into the buffer
        new Float32Array(this.buffer.getMappedRange()).set(this.vertices)
        this.buffer.unmap()

        // set the buffer layout
        this.bufferLayout = {
            arrayStride: 4 * 6,
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

        this.pipeline.addVertexBufferLayout(this.bufferLayout)
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
        passEncoder.setVertexBuffer(0, this.buffer)
        passEncoder.draw(3, 1, 0, index)
    }
}
