import { BindGroup } from "../BindGroup"
import { Renderable } from "../Renderable"
import shader from "../shaders.wgsl?raw"

export class TriangleMesh extends Renderable {
    constructor(
        x: number,
        y: number,
        z: number,
        device: GPUDevice,
        context: GPUCanvasContext,
        mainBindGroup: BindGroup,
    ) {
        super(device, context, mainBindGroup, 'TriangleMesh')

        // x y z r g b
        // prettier-ignore
        const vertices = new Float32Array([
            x + 0.0, y + 0.5, z + 0.0, 1.0, 0.0, 0.0,
            x + -0.5, y + -0.5, z + 0.0, 0.0, 1.0, 0.0,
            x + 0.5, y + -0.5, z + 0.0, 0.0, 0.0, 1.0,
        ])

        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true,
        }

        this.buffer = device.createBuffer(descriptor)

        new Float32Array(this.buffer.getMappedRange()).set(vertices)
        this.buffer.unmap()

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
    }

    public buildPipeline() {
        this.pipeline.addVertexBufferLayout(this.bufferLayout)
        this.pipeline.setVertexShader(shader, 'vert_main')
        this.pipeline.setFragmentShader(shader, 'frag_main')
        this.pipeline.addBindGroupLayout(this.mainBindGroup.getLayout())
        this.pipeline.build()
    }

    public draw(passEncoder: GPURenderPassEncoder) {
        passEncoder.setPipeline(this.pipeline.get())
        passEncoder.setBindGroup(0, this.mainBindGroup.get())
        passEncoder.setVertexBuffer(0, this.buffer)
        passEncoder.draw(3, 1, 0, 0)
    }
}
