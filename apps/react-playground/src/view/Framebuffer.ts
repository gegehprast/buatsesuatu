import { BindGroupBuilder } from "./BindGroupBuilder"

export class Framebuffer {
    public view!: GPUTextureView

    public bindGroup!: GPUBindGroup

    public depthStencilState!: GPUDepthStencilState
    private depthStencilBuffer!: GPUTexture
    private depthStencilView!: GPUTextureView
    public depthStencilAttachment?: GPURenderPassDepthStencilAttachment

    private name: string

    private colorAttachments: GPURenderPassColorAttachment[] = []

    constructor(name: string) {
        this.name = name
    }

    public async initialize(
        device: GPUDevice,
        canvas: HTMLCanvasElement,
        bindGroupLayout: GPUBindGroupLayout,
        format: GPUTextureFormat,
        depthEnabled: boolean,
        timeBuffer: GPUBuffer,
    ) {
        const texture = device.createTexture({
            size: {
                width: canvas.width,
                height: canvas.height,
            },
            format: format,
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.RENDER_ATTACHMENT,
            mipLevelCount: 1,
        })

        this.view = texture.createView({
            format: format,
            dimension: '2d',
            aspect: 'all',
            baseMipLevel: 0,
            mipLevelCount: 1,
            baseArrayLayer: 0,
            arrayLayerCount: 1,
        })

        const sampler = device.createSampler({
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            maxAnisotropy: 1,
        })

        const builder = new BindGroupBuilder(device)
        builder.setLayout(bindGroupLayout)
        builder.addBuffer(timeBuffer)
        builder.addBuffer(timeBuffer)
        builder.addMaterial(this.view, sampler)
        this.bindGroup = builder.build(`bg-framebuffer-${this.name}`)

        if (depthEnabled) {
            this.makeDepthBufferResources(device, canvas)
        }

        this.colorAttachments.push({
            view: this.view,
            clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
            loadOp: 'clear',
            storeOp: 'store',
        })
    }

    private makeDepthBufferResources(
        device: GPUDevice,
        canvas: HTMLCanvasElement,
    ) {
        this.depthStencilState = {
            format: 'depth24plus-stencil8',
            depthWriteEnabled: true,
            depthCompare: 'less-equal',
        }

        const size: GPUExtent3D = {
            width: canvas.width,
            height: canvas.height,
            depthOrArrayLayers: 1,
        }
        const depthBufferDescriptor: GPUTextureDescriptor = {
            size,
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        }
        this.depthStencilBuffer = device.createTexture(depthBufferDescriptor)

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: 'depth24plus-stencil8',
            dimension: '2d',
            aspect: 'all',
        }
        this.depthStencilView =
            this.depthStencilBuffer.createView(viewDescriptor)

        this.depthStencilAttachment = {
            view: this.depthStencilView,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilLoadOp: 'clear',
            stencilStoreOp: 'discard',
        }
    }

    public renderTo(commandEncoder: GPUCommandEncoder): GPURenderPassEncoder {
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: this.colorAttachments,
            depthStencilAttachment: this.depthStencilAttachment,
            label: `draw ${this.name}`,
        })

        return passEncoder
    }

    public readFrom(passEncoder: GPURenderPassEncoder, bindingIndex: number) {
        passEncoder.setBindGroup(bindingIndex, this.bindGroup)
    }
}
