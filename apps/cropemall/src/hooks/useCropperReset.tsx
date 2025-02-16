import { CropperContextValue } from '@/contexts/CropperContext'
import { Vector } from '@buatsesuatu/math'

type UseCropperResetProps = Pick<
    CropperContextValue,
    | 'container'
    | 'img'
    | 'setImgSize'
    | 'setImgPos'
    | 'setCropSize'
    | 'setCropPos'
    | 'setImgRotation'
>

const useCropperReset = ({
    container,
    img,
    setImgSize,
    setImgPos,
    setCropSize,
    setCropPos,
    setImgRotation,
}: UseCropperResetProps) => {
    const reset = () => {
        if (!container.current || !img.current) {
            return
        }

        const containerEl = container.current
        const imgEl = img.current

        const { width: cWidth, height: cHeight } =
            containerEl.getBoundingClientRect()

        // reset image size and position
        const ratio = imgEl.naturalWidth / imgEl.naturalHeight
        const newImgSize = { width: cHeight * ratio, height: cHeight }
        const newImgPos = new Vector((cWidth - newImgSize.width) / 2, 0)
        setImgSize(newImgSize)
        setImgPos(() => newImgPos)
        setImgRotation(0)

        // reset crop size and position
        let size = newImgSize.width * 0.8

        if (newImgSize.height < size) {
            size = newImgSize.height * 0.8
        }

        setCropSize({ width: size, height: size })
        setCropPos(
            () => new Vector((cWidth - size) / 2, (cHeight - size) / 2),
            {},
        )
    }

    return reset
}

export default useCropperReset
