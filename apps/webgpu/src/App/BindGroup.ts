import { Storage } from './Storage'
import { Uniform } from './Uniform'

export class BindGroup {
    private device: GPUDevice

    public label: string

    public layoutEntries: GPUBindGroupLayoutEntry[] = []

    public bindGroupEntries: GPUBindGroupEntry[] = []

    public layout?: GPUBindGroupLayout

    public bindGroup?: GPUBindGroup

    private binding: number = 0

    constructor(device: GPUDevice, label: string) {
        this.device = device
        this.label = label
    }

    public addUniformBuffer(stage: GPUShaderStageFlags, uniform: Uniform) {
        this.layoutEntries.push({
            binding: this.binding,
            visibility: stage,
            buffer: {
                type: 'uniform',
                hasDynamicOffset: false,
            },
        })
        
        this.bindGroupEntries.push({
            binding: this.binding,
            resource: {
                buffer: uniform.buffer,
                label: `BGE_${this.label}_${this.binding}`,
            },
        })

        this.binding++

        return this
    }
    
    public addStorageBUffer(stage: GPUShaderStageFlags, storage: Storage) {
        this.layoutEntries.push({
            binding: this.binding,
            visibility: stage,
            buffer: {
                type: 'read-only-storage',
                hasDynamicOffset: false,
            },
        })
        
        this.bindGroupEntries.push({
            binding: this.binding,
            resource: {
                buffer: storage.buffer,
                label: `BGE_${this.label}_${this.binding}`,
            },
        })

        this.binding++

        return this
    }

    public build() {
        this.layout = this.device.createBindGroupLayout({
            entries: this.layoutEntries,
            label: `BGL_${this.label}`,
        })

        this.bindGroup = this.device.createBindGroup({
            layout: this.layout,
            entries: this.bindGroupEntries,
            label: `BG_${this.label}`,
        })

        return this
    }
    
    public getLayout() {
        if (!this.layout) throw Error("Bind group layout not built.")

        return this.layout
    }
    
    public get() {
        if (!this.bindGroup) throw Error("Bind group not built.")

        return this.bindGroup
    }
}
