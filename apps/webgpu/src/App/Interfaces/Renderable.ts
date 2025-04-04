import { BindGroup } from '../BindGroup'
import { Pipeline } from '../Pipeline'

export interface Renderable {
    label: string

    device?: GPUDevice

    context?: GPUCanvasContext

    pipeline?: Pipeline

    mainBindGroup?: BindGroup

    vertexBuffer?: GPUBuffer

    vertexBufferLayout?: GPUVertexBufferLayout

    init(
        device: GPUDevice,
        context: GPUCanvasContext,
        mainBindGroup: BindGroup,
    ): void

    build(): void

    buildPipeline(): void

    render(
        commandEncoder: GPURenderPassEncoder,
        index: number,
    ): void
}
