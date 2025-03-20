export class RenderPipelineBuilder {
    private device: GPUDevice
    private bindGroupLayouts: GPUBindGroupLayout[] = []
    private buffers: GPUVertexBufferLayout[] = []
    private colorTargetStates: GPUColorTargetState[] = []
    private src_code?: string
    private vertex_entry?: string
    private fragment_entry?: string
    private depthStencilState?: GPUDepthStencilState
    private alphaBlend: boolean = false

    constructor(device: GPUDevice) {
        this.device = device
    }

    private reset() {
        this.bindGroupLayouts = []
        this.buffers = []
        this.colorTargetStates = []
        this.depthStencilState = undefined
        this.alphaBlend = false
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

    public setBlendState(blend: boolean) {
        this.alphaBlend = blend
    }

    public addRenderTarget(format: GPUTextureFormat) {
        const target: GPUColorTargetState = {
            format: format,
        }

        if (this.alphaBlend) {
            target.blend = {
                color: {
                    operation: 'add',
                    srcFactor: 'src-alpha',
                    dstFactor: 'one-minus-src-alpha',
                },
                alpha: {
                    operation: 'add',
                    srcFactor: 'one',
                    dstFactor: 'zero',
                },
            }
        }

        this.colorTargetStates.push(target)
    }

    public setDepthStencilState(depthStencil: GPUDepthStencilState) {
        this.depthStencilState = depthStencil
    }

    /**
     * Will reset the builder after building the bind group layout
     *
     * @returns
     */
    public build(label: string): GPURenderPipeline {
        if (!this.src_code || !this.vertex_entry || !this.fragment_entry) {
            throw new Error(
                'Source code, vertex entry, and fragment entry are required',
            )
        }

        const layout = this.device.createPipelineLayout({
            bindGroupLayouts: this.bindGroupLayouts,
            label: label,
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
            label: label,
        })

        this.reset()

        return pipeline
    }
}
