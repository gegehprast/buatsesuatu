import { App } from './App'
import { Scene } from './Scene'

export class Renderer {
    private app: App

    private depthStencilAttachment!: GPURenderPassDepthStencilAttachment

    constructor(app: App) {
        this.app = app

        this.init()
    }

    public init() {
        const depthStencilBuffer = this.app.device!.createTexture({
            size: {
            width: this.app.canvas.width,
            height: this.app.canvas.height,
            depthOrArrayLayers: 1,
        },
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        })

        const depthStencilView = depthStencilBuffer.createView({
            format: 'depth24plus-stencil8',
            dimension: '2d',
            aspect: 'all',
        })

        this.depthStencilAttachment = {
            view: depthStencilView,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilLoadOp: 'clear',
            stencilStoreOp: 'discard',
        }
    }

    public render(scenes: Scene[]) {
        const commandEncoder = this.app.device!.createCommandEncoder({
            label: 'command encoder',
        })

        const textureView = this.app.context!.getCurrentTexture().createView()
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
            depthStencilAttachment: this.depthStencilAttachment,
        })

        for (const [s, scene] of scenes.entries()) {
            for (const [o, object] of scene.objects.entries()) {
                object.mesh.render(passEncoder, s * scene.objects.length + o)
            }
        }

        passEncoder.end()

        this.app.device!.queue.submit([commandEncoder.finish()])
    }
}
