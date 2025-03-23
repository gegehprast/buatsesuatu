import { degToRad } from '@buatsesuatu/math'
import { vec3, mat4 } from 'gl-matrix'

export class Triangle {
    private position: vec3
    private eulers: vec3
    private model: mat4

    constructor(position: vec3, theta: number) {
        this.position = position
        this.eulers = vec3.create()
        this.eulers[2] = theta
        this.model = mat4.create()
    }

    public update() {
        this.eulers[2] += 1
        this.eulers[2] %= 360

        this.model = mat4.create()
        mat4.translate(this.model, this.model, this.position)
        mat4.rotateZ(this.model, this.model, degToRad(this.eulers[2]))
    }

    public getModel(): mat4 {
        return this.model
    }
}

export class TriangleMesh {
    public buffer: GPUBuffer

    public bufferLayout: GPUVertexBufferLayout

    constructor(device: GPUDevice) {
        // x y z r g b
        // prettier-ignore
        const vertices = new Float32Array([
            0.0, 0.5, 0.0, 1.0, 0.0, 0.0,
            -0.5, -0.5, 0.0, 0.0, 1.0, 0.0,
            0.5, -0.5, 0.0, 0.0, 0.0, 1.0,
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
}
