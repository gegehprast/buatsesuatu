export class Pipeline {
    private device: GPUDevice

    public label: string

    private vertexBuffers: GPUVertexBufferLayout[] = []

    private vertex?: GPUVertexState

    private fragment?: GPUFragmentState

    public bindGroupLayouts: GPUBindGroupLayout[] = []

    public pipeline?: GPURenderPipeline

    constructor(device: GPUDevice, label: string) {
        this.device = device
        this.label = label
    }

    public addVertexBufferLayout(
        layout: GPUVertexBufferLayout,
    ) {
        this.vertexBuffers.push(layout)
    }

    public setVertexShader(shader: string, entryPoint: string) {
        this.vertex = {
            module: this.device.createShaderModule({
                code: shader,
                label: `P_VS_${this.label}`,
            }),
            entryPoint: entryPoint,
            buffers: this.vertexBuffers
        }

        return this
    }

    public setFragmentShader(shader: string, entryPoint: string) {
        this.fragment = {
            module: this.device.createShaderModule({
                code: shader,
                label: `P_FS_${this.label}`,
            }),
            entryPoint: entryPoint,
            targets: [
                {
                    format: 'bgra8unorm',
                },
            ],
        }

        return this
    }

    public addBindGroupLayout(layout: GPUBindGroupLayout) {
        this.bindGroupLayouts.push(layout)

        return this
    }

    public build() {
        if (!this.vertex) throw Error('Vertex shader not set.')

        this.pipeline = this.device.createRenderPipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: this.bindGroupLayouts,
                label: `PL_${this.label}`,
            }),
            vertex: this.vertex,
            fragment: this.fragment,
            primitive: {
                topology: 'triangle-list',
            },
        })

        return this
    }

    public get() {
        if (!this.pipeline) throw Error('Pipeline not built.')

        return this.pipeline
    }
}
