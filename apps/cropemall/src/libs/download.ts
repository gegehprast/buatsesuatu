import { Vector } from '@cropemall/math'

export const download = (
    image: HTMLImageElement,
    renderedImageSize: { width: number; height: number },
    cropperSize: { width: number; height: number },
    cropperPos: Vector,
    renderedImagePosition: Vector,
) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return
    }

    const ratioToNatural = image.naturalWidth / renderedImageSize.width
    const actualCropperSize = {
        width: cropperSize.width * ratioToNatural,
        height: cropperSize.height * ratioToNatural,
    }
    const distCropperToImage = cropperPos.sub(renderedImagePosition)
    const actualPosition = distCropperToImage.mult(ratioToNatural)

    ctx.canvas.width = actualCropperSize.width
    ctx.canvas.height = actualCropperSize.height

    ctx.drawImage(
        image,
        actualPosition.x,
        actualPosition.y,
        actualCropperSize.width,
        actualCropperSize.height,
        0,
        0,
        actualCropperSize.width,
        actualCropperSize.height,
    )

    const data = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = data
    link.download = 'cropped.png'
    link.click()
}
