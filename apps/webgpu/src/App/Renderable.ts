import { BindGroup } from './BindGroup'
import { Pipeline } from './Pipeline'

export abstract class Renderable {
    public context: GPUCanvasContext
    
    public pipeline: Pipeline

    public mainBindGroup: BindGroup

    public buffer?: GPUBuffer

    public bufferLayout?: GPUVertexBufferLayout

    constructor(device: GPUDevice, context: GPUCanvasContext, mainBindGroup: BindGroup, label: string) {
        this.context = context
        this.pipeline = new Pipeline(device, label)
        this.mainBindGroup = mainBindGroup
    }

    public abstract buildPipeline(): void
    
    public abstract draw(commandEncoder: GPURenderPassEncoder): void
}
