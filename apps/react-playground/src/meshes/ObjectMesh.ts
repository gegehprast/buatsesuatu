import { mat4, vec2, vec3, vec4 } from "gl-matrix"

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

    public async initialize(
        device: GPUDevice,
        obj: string,
        vEnabled: boolean,
        vtEnabled: boolean,
        vnEnabled: boolean,
        preTransform: mat4,
    ) {
        await this.readObj(obj, vEnabled, vtEnabled, vnEnabled, preTransform)

        const attributes: GPUVertexAttribute[] = []
        let floatsPerVertex = 0
        let attributesPerVertex = 0

        if (vEnabled) {
            attributes.push({
                shaderLocation: attributesPerVertex,
                format: 'float32x3',
                offset: floatsPerVertex * 4,
            })
            attributesPerVertex += 1 
            floatsPerVertex += 3
        }

        if (vtEnabled) {
            attributes.push({
                shaderLocation: attributesPerVertex,
                format: 'float32x2',
                offset: floatsPerVertex * 4,
            })
            attributesPerVertex += 1
            floatsPerVertex += 2
        }

        if (vnEnabled) {
            attributes.push({
                shaderLocation: attributesPerVertex,
                format: 'float32x3',
                offset: floatsPerVertex * 4,
            })
            attributesPerVertex += 1
            floatsPerVertex += 3
        }

        this.vertexCount = this.vertices.length / floatsPerVertex

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
            arrayStride: 4 * floatsPerVertex,
            attributes: attributes,
        }
    }

    public getModel() {
        return {
            buffer: this.buffer,
            layout: this.bufferLayout,
        }
    }

    private async readObj(
        obj: string,
        vEnabled: boolean,
        vtEnabled: boolean,
        vnEnabled: boolean,
        preTransform: mat4,
    ) {
        const result: number[] = []

        const lines = obj.split('\n')

        for (const line of lines) {
            if (line.startsWith('v ')) {
                this.readVertex(line, preTransform)
            } else if (line.startsWith('vt ')) {
                this.readTexCoord(line)
            } else if (line.startsWith('vn ')) {
                this.readNormal(line, preTransform)
            } else if (line.startsWith('f ')) {
                this.readFace(line, result, vEnabled, vtEnabled, vnEnabled)
            }
        }

        this.vertices = new Float32Array(result)
    }

    private readVertex(line: string, preTransform: mat4) {
        const parts = line.split(' ') // v x y z
        const x = parseFloat(parts[1])
        const y = parseFloat(parts[2])
        const z = parseFloat(parts[3])
        const newVertex = vec4.fromValues(x, y, z, 1.0)

        const v = vec4.create()
        vec4.transformMat4(v, newVertex, preTransform)

        this.v.push(vec3.fromValues(v[0], v[1], v[2]))
    }

    private readTexCoord(line: string) {
        const parts = line.split(' ') // vt u v
        const u = parseFloat(parts[1])
        const v = parseFloat(parts[2])

        this.vt.push(vec2.fromValues(u, v))
    }

    private readNormal(line: string, preTransform: mat4) {
        const parts = line.split(' ') // vn x y z
        const x = parseFloat(parts[1])
        const y = parseFloat(parts[2])
        const z = parseFloat(parts[3])
        const newNormal = vec4.fromValues(x, y, z, 0.0)

        const vn = vec4.create()
        vec4.transformMat4(vn, newNormal, preTransform)
        vec4.normalize(vn, vn)

        this.vn.push(vec3.fromValues(vn[0], vn[1], vn[2]))
    }

    private readFace(
        line: string,
        result: number[],
        vEnabled: boolean,
        vtEnabled: boolean,
        vnEnabled: boolean,
    ) {
        line = line.replace('\n', '')

        const vertexDescriptions = line.split(' ') // f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ...
        const triangleCount = vertexDescriptions.length - 3

        for (let i = 0; i < triangleCount; i++) {
            this.readConrner(vertexDescriptions[1], result, vEnabled, vtEnabled, vnEnabled)
            this.readConrner(vertexDescriptions[2 + i], result, vEnabled, vtEnabled, vnEnabled)
            this.readConrner(vertexDescriptions[3 + i], result, vEnabled, vtEnabled, vnEnabled)
        }
    }

    private readConrner(
        vertexDescription: string,
        result: number[],
        vEnabled: boolean,
        vtEnabled: boolean,
        vnEnabled: boolean,
    ) {
        const v_vt_vn = vertexDescription.split('/') // v/vt/vn
        const v = this.v[parseInt(v_vt_vn[0]) - 1]
        const vt = this.vt[parseInt(v_vt_vn[1]) - 1]
        const vn = this.vn[parseInt(v_vt_vn[2]) - 1]

        if (vEnabled) {
            result.push(v[0], v[1], v[2])
        }

        if (vtEnabled) {
            result.push(vt[0], vt[1])
        }
        
        if (vnEnabled) {
            result.push(vn[0], vn[1], vn[2])
        }
    }
}
