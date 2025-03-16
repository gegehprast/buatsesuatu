export class Triangle {
    public buffer: GPUBuffer

    public bufferLayout: GPUVertexBufferLayout

    constructor(device: GPUDevice) {
        // x y z r g b
        // prettier-ignore
        const vertices = new Float32Array([
            0.0,  0.0,  0.5, 1.0, 0.0, 0.0,
            0.0, -0.5, -0.5, 0.0, 1.0, 0.0,
            0.0,  0.5, -0.5, 0.0, 0.0, 1.0
        ])

        const usage: GPUBufferUsageFlags =
            GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST

        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage,
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
}
