import { Scene } from './Scene'

export class Renderer {
    private device: GPUDevice

    private context: GPUCanvasContext

    constructor(device: GPUDevice, context: GPUCanvasContext) {
        this.device = device
        this.context = context
    }

    public render(scenes: Scene[]) {
        const commandEncoder = this.device.createCommandEncoder({
            label: 'command encoder',
        })

        // Render
        const textureView = this.context.getCurrentTexture().createView()
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: textureView,
                    clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                },
            ],
            label: `Renderpass`,
        })

        for (const scene of scenes) {
            for (const object of scene.objects) {
                object.draw(passEncoder)
            }
        }

        passEncoder.end()

        this.device.queue.submit([commandEncoder.finish()])
    }
}
