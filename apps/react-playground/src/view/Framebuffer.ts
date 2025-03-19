import { BindGroupBuilder } from "./BindGroupBuilder"

export class Framebuffer {
    private texture!: GPUTexture

    public view!: GPUTextureView

    private sampler!: GPUSampler

    public bindGroup!: GPUBindGroup

    public async initialize(
        device: GPUDevice,
        canvas: HTMLCanvasElement,
        bindGroupLayout: GPUBindGroupLayout,
        format: GPUTextureFormat,
    ) {
        const width = canvas.width
        const height = canvas.height

        const textureDescriptor: GPUTextureDescriptor = {
            size: {
                width: width,
                height: height,
            },
            format: format,
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.RENDER_ATTACHMENT,
            mipLevelCount: 1,
        }

        this.texture = device.createTexture(textureDescriptor)

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: format,
            dimension: '2d',
            aspect: 'all',
            baseMipLevel: 0,
            mipLevelCount: 1,
            baseArrayLayer: 0,
            arrayLayerCount: 1,
        }

        this.view = this.texture.createView(viewDescriptor)

        const samplerDescriptor: GPUSamplerDescriptor = {
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            maxAnisotropy: 1,
        }

        this.sampler = device.createSampler(samplerDescriptor)

        const builder = new BindGroupBuilder(device)
        builder.setLayout(bindGroupLayout)
        builder.addMaterial(this.view, this.sampler)
        this.bindGroup = builder.build()
    }
}
