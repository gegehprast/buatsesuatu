import { vec2, vec3 } from "gl-matrix"

export class ObjectMesh {
    public buffer!: GPUBuffer

    public bufferLayout!: GPUVertexBufferLayout

    private v: vec3[]
    private vt: vec2[]
    private vn: vec3[]
    private vertices: Float32Array
    public vertexCount: number

    constructor() {
        this.v = []
        this.vt = []
        this.vn = []
        this.vertices = new Float32Array()
        this.vertexCount = 0
    }

    public async initialize(device: GPUDevice, obj: string) {
        await this.readObj(obj)

        this.vertexCount = this.vertices.length / 5

        const usage: GPUBufferUsageFlags =
            GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST

        const descriptor: GPUBufferDescriptor = {
            size: this.vertices.byteLength,
            usage,
            mappedAtCreation: true,
        }

        this.buffer = device.createBuffer(descriptor)

        new Float32Array(this.buffer.getMappedRange()).set(this.vertices)
        this.buffer.unmap()

        this.bufferLayout = {
            arrayStride: 4 * 5,
            attributes: [
                {
                    shaderLocation: 0,
                    format: 'float32x3',
                    offset: 0,
                },
                {
                    shaderLocation: 1,
                    format: 'float32x2',
                    offset: 4 * 3,
                },
            ],
        }
    }

    public getModel() {
        return {
            buffer: this.buffer,
            layout: this.bufferLayout,
        }
    }

    private async readObj(obj: string) {
        const result: number[] = []

        const lines = obj.split('\n')

        for (const line of lines) {
            if (line.startsWith('v ')) {
                this.readVertex(line)
            } else if (line.startsWith('vt ')) {
                this.readTexCoord(line)
            } else if (line.startsWith('vn ')) {
                this.readNormal(line)
            } else if (line.startsWith('f ')) {
                this.readFace(line, result)
            }
        }

        this.vertices = new Float32Array(result)
    }

    private readVertex(line: string) {
        const parts = line.split(' ') // v x y z
        const x = parseFloat(parts[1])
        const y = parseFloat(parts[2])
        const z = parseFloat(parts[3])

        this.v.push(vec3.fromValues(x, y, z))
    }

    private readTexCoord(line: string) {
        const parts = line.split(' ') // vt u v
        const u = parseFloat(parts[1])
        const v = parseFloat(parts[2])

        this.vt.push(vec2.fromValues(u, v))
    }

    private readNormal(line: string) {
        const parts = line.split(' ') // vn x y z
        const x = parseFloat(parts[1])
        const y = parseFloat(parts[2])
        const z = parseFloat(parts[3])

        this.vn.push(vec3.fromValues(x, y, z))
    }

    private readFace(line: string, result: number[]) {
        line = line.replace('\n', '')

        const vertexDescriptions = line.split(' ') // f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ...
        const triangleCount = vertexDescriptions.length - 3

        for (let i = 0; i < triangleCount; i++) {
            this.readConrner(vertexDescriptions[1], result)
            this.readConrner(vertexDescriptions[2 + i], result)
            this.readConrner(vertexDescriptions[3 + i], result)
        }
    }

    private readConrner(vertexDescription: string, result: number[]) {
        const v_vt_vn = vertexDescription.split('/') // v/vt/vn
        const v = this.v[parseInt(v_vt_vn[0]) - 1]
        const vt = this.vt[parseInt(v_vt_vn[1]) - 1]

        result.push(v[0], v[1], v[2], vt[0], vt[1])
    }
}
