import { Vector } from '@cropemall/math'

export const getResult = (
    image: HTMLImageElement,
    renderedImageSize: { width: number; height: number },
    renderedImageRotation: number,
    cropperSize: { width: number; height: number },
    cropperPos: Vector,
    renderedImagePosition: Vector,
) => {
    return new Promise<string | null>((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        ctx.canvas.width = image.naturalWidth
        ctx.canvas.height = image.naturalHeight

        // apply rotation
        ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2)
        ctx.rotate(renderedImageRotation)
        ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2)

        // draw the image to the canvas
        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
        )

        // save the current state of the canvas
        const saved = canvas.toDataURL('image/png')

        // clean up
        canvas.remove()

        // create a new image element and load the saved image
        const newImage = new Image()
        newImage.src = saved
        newImage.onload = () => {
            const newCanvas = document.createElement('canvas')
            const newCtx = newCanvas.getContext('2d')

            if (!newCtx) return

            const ratioToNatural = image.naturalWidth / renderedImageSize.width
            const actualCropperSize = {
                width: cropperSize.width * ratioToNatural,
                height: cropperSize.height * ratioToNatural,
            }

            const distCropperToImage = cropperPos.sub(renderedImagePosition)
            const actualPosition = distCropperToImage.mult(ratioToNatural)

            newCtx.canvas.width = actualCropperSize.width
            newCtx.canvas.height = actualCropperSize.height

            newCtx.drawImage(
                newImage,
                actualPosition.x,
                actualPosition.y,
                actualCropperSize.width,
                actualCropperSize.height,
                0,
                0,
                actualCropperSize.width,
                actualCropperSize.height,
            )

            resolve(newCanvas.toDataURL('image/png'))

            // clean up
            newCanvas.remove()
            newImage.remove()
        }
    })
}

export const download = async (
    image: HTMLImageElement,
    renderedImageSize: { width: number; height: number },
    renderedImageRotation: number,
    cropperSize: { width: number; height: number },
    cropperPos: Vector,
    renderedImagePosition: Vector,
) => {
    const data = await getResult(
        image,
        renderedImageSize,
        renderedImageRotation,
        cropperSize,
        cropperPos,
        renderedImagePosition,
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
