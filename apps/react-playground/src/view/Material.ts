import { BindGroupBuilder } from "./BindGroupBuilder"

export class Material {
    private texture!: GPUTexture

    private view!: GPUTextureView

    private sampler!: GPUSampler

    public bindGroup!: GPUBindGroup

    public async initialize(
        device: GPUDevice,
        name: string,
        ext: 'jpg' | 'png' | 'jpeg' | 'webp',
        mipLevels: number,
        bindGroupLayout: GPUBindGroupLayout,
    ) {
        const imageBitmaps: ImageBitmap[] = []
        let highestWidth = 0
        let highestHeight = 0

        for (let i = 0; i < mipLevels; i++) {
            const imageUrl = new URL(
                `../assets/${name}/${name}${i}.${ext}`,
                import.meta.url,
            )
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const imageBitmap = await createImageBitmap(blob)

            if (i === 0) {
                highestWidth = imageBitmap.width
                highestHeight = imageBitmap.height
            }

            imageBitmaps.push(imageBitmap)
        }

        const textureDescriptor: GPUTextureDescriptor = {
            size: {
                width: highestWidth,
                height: highestHeight,
            },
            format: navigator.gpu.getPreferredCanvasFormat(),
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
            mipLevelCount: mipLevels,
        }

        this.texture = device.createTexture(textureDescriptor)

        for (const [i, imageBitmap] of imageBitmaps.entries()) {
            await this.loadImageBitmap(device, imageBitmap, i)

            imageBitmap.close()
        }

        const viewDescriptor: GPUTextureViewDescriptor = {
            format: navigator.gpu.getPreferredCanvasFormat(),
            dimension: '2d',
            aspect: 'all',
            baseMipLevel: 0,
            mipLevelCount: mipLevels,
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
            maxAnisotropy: 4,
        }

        this.sampler = device.createSampler(samplerDescriptor)

        const builder = new BindGroupBuilder(device)
        builder.setLayout(bindGroupLayout)
        builder.addMaterial(this.view, this.sampler)
        this.bindGroup = builder.build()
    }

    private async loadImageBitmap(
        device: GPUDevice,
        imageData: ImageBitmap,
        mipLevel: number,
    ) {
        device.queue.copyExternalImageToTexture(
            { source: imageData },
            { texture: this.texture, mipLevel: mipLevel },
            {
                width: imageData.width,
                height: imageData.height,
            },
        )
    }
}
