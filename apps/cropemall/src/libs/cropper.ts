import { Vector } from '@buatsesuatu/math'

export type Size = { width: number; height: number }

export type Bounds = {
    minX: number
    maxX: number
    minY: number
    maxY: number
}

export type State = {
    renderedImageBounds: Bounds
    renderedCropperSize: Size
    renderedCropperPos: Vector

    imageRotation: number

    actualImageDimension: Size
    actualImageBounds: Bounds
    actualCropperSize: Size
    actualCropperPos: Vector
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

export const getState = (
    image: HTMLImageElement,
    renderedImageRotation: number,
    renderedImageBounds: Bounds,
    renderedCropperSize: Size,
    renderedCropperPos: Vector,
): State => {
    const actualImageBounds = getBounds(
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        renderedImageRotation,
    )
    const actualImageDimension = {
        width: actualImageBounds.maxX - actualImageBounds.minX,
        height: actualImageBounds.maxY - actualImageBounds.minY,
    }

    const ratioToActual =
        actualImageDimension.width /
        (renderedImageBounds.maxX - renderedImageBounds.minX)
    const actualCropperSize = {
        width: renderedCropperSize.width * ratioToActual,
        height: renderedCropperSize.height * ratioToActual,
    }
    const distCropperToImage = renderedCropperPos.sub(
        new Vector(renderedImageBounds.minX, renderedImageBounds.minY),
    )
    const actualCropperPos = distCropperToImage.mult(ratioToActual)

    return {
        renderedImageBounds,
        renderedCropperSize,
        renderedCropperPos,

        imageRotation: renderedImageRotation,

        actualImageDimension,
        actualImageBounds,
        actualCropperSize,
        actualCropperPos,
    }
}

export function getResult(image: HTMLImageElement, state: State) {
    return new Promise<string | null>((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const croppedCanvas = document.createElement('canvas')
        const croppedCtx = croppedCanvas.getContext('2d')

        if (!ctx || !croppedCtx) return

        ctx.canvas.width = state.actualImageDimension.width
        ctx.canvas.height = state.actualImageDimension.height

        // apply rotation
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
        ctx.rotate(state.imageRotation)
        ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2)

        // draw the image to the canvas
        ctx.drawImage(
            image,
            state.actualImageBounds.minX,
            state.actualImageBounds.minY,
            ctx.canvas.width,
            ctx.canvas.height,
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height,
        )

        // reset the rotation
        ctx.setTransform(1, 0, 0, 1, 0, 0)

        // crate a new canvas to draw the cropped image

        croppedCtx.canvas.width = state.actualCropperSize.width
        croppedCtx.canvas.height = state.actualCropperSize.height

        croppedCtx.drawImage(
            canvas,
            state.actualCropperPos.x,
            state.actualCropperPos.y,
            croppedCtx.canvas.width,
            croppedCtx.canvas.height,
            0,
            0,
            croppedCtx.canvas.width,
            croppedCtx.canvas.height,
        )

        // save the current state of the canvas
        const saved = croppedCanvas.toDataURL('image/png')

        // clean up
        canvas.remove()
        croppedCanvas.remove()

        resolve(saved)
    })
}

export async function download(image: HTMLImageElement, state: State) {
    const data = await getResult(image, state)

    if (!data) {
        return
    }

    function downloadImage(data: string) {
        return new Promise<void>((resolve) => {
            const link = document.createElement('a')
            link.href = data
            link.download = 'cropped.png'
            link.click()
            link.remove()
            resolve()
        })
    }

    await downloadImage(data)
}
