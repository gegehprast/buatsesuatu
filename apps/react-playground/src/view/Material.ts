export class Material {
    texture!: GPUTexture

    view!: GPUTextureView

    sampler!: GPUSampler

    bindGroup!: GPUBindGroup

    public async initialize(
        device: GPUDevice,
        src: string,
        bindGroupLayout: GPUBindGroupLayout,
    ) {
        const response = await fetch(src)
        const blob = await response.blob()
        const imageData = await createImageBitmap(blob)

        await this.loadImage(device, imageData)

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: navigator.gpu.getPreferredCanvasFormat(),
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
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            maxAnisotropy: 1,
        }

        this.sampler = device.createSampler(samplerDescriptor)

        this.bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: this.view,
                },
                {
                    binding: 1,
                    resource: this.sampler,
                },
            ],
        })
    }

    async loadImage(device: GPUDevice, imageData: ImageBitmap) {
        const textureDescriptor: GPUTextureDescriptor = {
            size: {
                width: imageData.width,
                height: imageData.height,
            },
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        }

        this.texture = device.createTexture(textureDescriptor)

        device.queue.copyExternalImageToTexture(
            { source: imageData },
            { texture: this.texture },
            textureDescriptor.size,
        )
    }
}
