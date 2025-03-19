export class BindGroupBuilder {
    private device: GPUDevice
    private layout?: GPUBindGroupLayout
    private entries: GPUBindGroupEntry[] = []
    private binding: number = 0

    constructor(device: GPUDevice) {
        this.device = device
    }

    private reset() {
        this.entries = []
        this.binding = 0
    }

    public setLayout(layout: GPUBindGroupLayout) {
        this.layout = layout
    }

    public addBuffer(buffer: GPUBuffer) {
        this.entries.push({
            binding: this.binding,
            resource: {
                buffer: buffer,
            },
        })
        this.binding += 1
    }

    public addMaterial(view: GPUTextureView, sampler: GPUSampler) {
        this.entries.push({
            binding: this.binding,
            resource: view,
        })
        this.binding += 1

        this.entries.push({
            binding: this.binding,
            resource: sampler,
        })
        this.binding += 1
    }

    /**
     * Will reset the builder after building the bind group layout
     *
     * @returns
     */
    public build(): GPUBindGroup {
        if (!this.layout) {
            throw new Error('Layout not set')
        }

        const bindGroup = this.device.createBindGroup({
            layout: this.layout,
            entries: this.entries,
        })

        this.reset()

        return bindGroup
    }
}
