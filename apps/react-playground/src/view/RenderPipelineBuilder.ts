export class RenderPipelineBuilder {
    private device: GPUDevice
    private bindGroupLayouts: GPUBindGroupLayout[] = []
    private buffers: GPUVertexBufferLayout[] = []
    private colorTargetStates: GPUColorTargetState[] = []
    private src_code?: string
    private vertex_entry?: string
    private fragment_entry?: string
    private depthStencilState?: GPUDepthStencilState

    constructor(device: GPUDevice) {
        this.device = device
    }

    private reset() {
        this.bindGroupLayouts = []
        this.buffers = []
    }

    public async addBindGroupLayout(layout: GPUBindGroupLayout) {
        this.bindGroupLayouts.push(layout)
    }

    public setSourceCode(
        src_code: string,
        vertex_entry: string,
        fragment_entry: string,
    ) {
        this.src_code = src_code
        this.vertex_entry = vertex_entry
        this.fragment_entry = fragment_entry
    }

    public addVertexBufferDescription(
        vertexBufferLayout: GPUVertexBufferLayout,
    ) {
        this.buffers.push(vertexBufferLayout)
    }

    public addColorFormat(format: GPUTextureFormat) {
        this.colorTargetStates.push({
            format: format,
        })
    }

    public setDepthStencilState(depthStencil: GPUDepthStencilState) {
        this.depthStencilState = depthStencil
    }

    /**
     * Will reset the builder after building the bind group layout
     *
     * @returns
     */
    public build(): GPURenderPipeline {
        if (!this.src_code || !this.vertex_entry || !this.fragment_entry) {
            throw new Error(
                'Source code, vertex entry, and fragment entry are required',
            )
        }

        const layout = this.device.createPipelineLayout({
            bindGroupLayouts: this.bindGroupLayouts,
        })

        const pipeline = this.device.createRenderPipeline({
            vertex: {
                module: this.device.createShaderModule({
                    code: this.src_code,
                }),
                entryPoint: this.vertex_entry,
                buffers: this.buffers,
            },

            fragment: {
                module: this.device.createShaderModule({
                    code: this.src_code,
                }),
                entryPoint: this.fragment_entry,
                targets: this.colorTargetStates,
            },

            primitive: {
                topology: 'triangle-list',
            },

            layout: layout,
            depthStencil: this.depthStencilState,
        })

        this.reset()

        return pipeline
    }
}
