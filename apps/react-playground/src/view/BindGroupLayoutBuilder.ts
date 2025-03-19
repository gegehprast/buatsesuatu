export class BindGroupLayoutBuilder {
    private device: GPUDevice
    private bindGroupLayoutEntries: GPUBindGroupLayoutEntry[] = []
    private binding: number = 0

    constructor(device: GPUDevice) {
        this.device = device
    }

    private reset() {
        this.bindGroupLayoutEntries = []
        this.binding = 0
    }
    
    public addBuffer(visibility: GPUFlagsConstant, type: GPUBufferBindingType) {
        this.bindGroupLayoutEntries.push({
            binding: this.binding,
            visibility: visibility,
            buffer: {
                type: type,
                hasDynamicOffset: false,
            },
        })
        this.binding += 1
    }
    
    public addMaterial(visibility: GPUFlagsConstant, type: GPUTextureViewDimension) {
        this.bindGroupLayoutEntries.push({
            binding: this.binding,
            visibility: visibility,
            texture: {
                viewDimension: type,
            },
        })
        this.binding += 1

        this.bindGroupLayoutEntries.push({
            binding: this.binding,
            visibility: visibility,
            sampler: {},
        })
        this.binding += 1
    }

    /**
     * Will reset the builder after building the bind group layout
     * 
     * @returns 
     */
    public build(): GPUBindGroupLayout {
        const layout: GPUBindGroupLayout = this.device.createBindGroupLayout({
            entries: this.bindGroupLayoutEntries,
        })
        this.reset()
        return layout
    }
}
