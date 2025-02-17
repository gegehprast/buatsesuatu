import { getResult } from '@/libs/cropper'
import { CropperContextValue } from '@/contexts/CropperContext'

type UseCropperResultProps = Pick<
    CropperContextValue,
    | 'img'
    | 'imgRotation'
    | 'imgBounds'
    | 'cropSize'
    | 'cropPos'
    | 'setResult'
>

const useCropperResult = ({
    img,
    imgRotation,
    imgBounds,
    cropSize,
    cropPos,
    setResult,
}: UseCropperResultProps) => {
    const _getResult = async () => {
        if (!img.current) return

        const result = await getResult(
            img.current,
            imgRotation,
            imgBounds,
            cropSize,
            cropPos,
        )

        if (!result) return

        setResult(result)

        return result
    }

    return _getResult
}

export default useCropperResult
