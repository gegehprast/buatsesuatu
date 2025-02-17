import { Vector } from '@buatsesuatu/math'

export type Bounds = {
    minX: number
    maxX: number
    minY: number
    maxY: number
}

export const getBounds = (
    x: number,
    y: number,
    w: number,
    h: number,
    rotation: number,
): Bounds => {
    let a = new Vector(x, y)
    let b = new Vector(x + w, y)
    let c = new Vector(x, y + h)
    let d = new Vector(x + w, y + h)

    const center = new Vector(x + w / 2, y + h / 2)

    a = a.rotate(center, rotation)
    b = b.rotate(center, rotation)
    c = c.rotate(center, rotation)
    d = d.rotate(center, rotation)

    const minX = Math.min(a.x, b.x, c.x, d.x)
    const maxX = Math.max(a.x, b.x, c.x, d.x)
    const minY = Math.min(a.y, b.y, c.y, d.y)
    const maxY = Math.max(a.y, b.y, c.y, d.y)

    return { minX, maxX, minY, maxY }
}

export const getResult = (
    image: HTMLImageElement,
    renderedImageRotation: number,
    renderedImageBounds: Bounds,
    cropperSize: { width: number; height: number },
    cropperPos: Vector,
) => {
    return new Promise<string | null>((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        const bounds = getBounds(
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            renderedImageRotation,
        )

        const renderedWidth =
            renderedImageBounds.maxX - renderedImageBounds.minX
        const naturalWidth = bounds.maxX - bounds.minX
        const naturalHeight = bounds.maxY - bounds.minY

        ctx.canvas.width = naturalWidth
        ctx.canvas.height = naturalHeight

        // apply rotation
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
        ctx.rotate(renderedImageRotation)
        ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2)

        // draw the image to the canvas
        ctx.drawImage(
            image,
            bounds.minX,
            bounds.minY,
            naturalWidth,
            naturalHeight,
            0,
            0,
            naturalWidth,
            naturalHeight,
        )

        // reset the rotation
        ctx.setTransform(1, 0, 0, 1, 0, 0)

        // crop area
        const ratioToNatural = naturalWidth / renderedWidth
        const actualCropperSize = {
            width: cropperSize.width * ratioToNatural,
            height: cropperSize.height * ratioToNatural,
        }
        const distCropperToImage = cropperPos.sub(
            new Vector(renderedImageBounds.minX, renderedImageBounds.minY),
        )
        const actualPosition = distCropperToImage.mult(ratioToNatural)

        // crate a new canvas to draw the cropped image
        const croppedCanvas = document.createElement('canvas')
        const croppedCtx = croppedCanvas.getContext('2d')

        if (!croppedCtx) return

        croppedCtx.canvas.width = actualCropperSize.width
        croppedCtx.canvas.height = actualCropperSize.height

        croppedCtx.drawImage(
            canvas,
            actualPosition.x,
            actualPosition.y,
            actualCropperSize.width,
            actualCropperSize.height,
            0,
            0,
            actualCropperSize.width,
            actualCropperSize.height,
        )

        // save the current state of the canvas
        const saved = croppedCanvas.toDataURL('image/png')

        // clean up
        canvas.remove()
        croppedCanvas.remove()

        resolve(saved)
    })
}

export const download = async (
    image: HTMLImageElement,
    renderedImageRotation: number,
    renderedImageBounds: Bounds,
    cropperSize: { width: number; height: number },
    cropperPos: Vector,
) => {
    const data = await getResult(
        image,
        renderedImageRotation,
        renderedImageBounds,
        cropperSize,
        cropperPos,
    )

    if (!data) {
        return
    }

    const link = document.createElement('a')
    link.href = data
    link.download = 'cropped.png'
    link.click()
    link.remove()
}
