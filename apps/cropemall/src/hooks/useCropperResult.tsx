import { getResult, getState } from '@/libs/cropper'
import { CropperContextValue } from '@/contexts/CropperContext'

type UseCropperResultProps = Pick<
    CropperContextValue,
    'img' | 'imgRotation' | 'imgBounds' | 'cropSize' | 'cropPos' | 'setResult'
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

        const state = getState(
            img.current,
            imgRotation,
            imgBounds,
            cropSize,
            cropPos,
        )

        const result = await getResult(img.current, state)

        if (!result) return

        setResult(result)

        return result
    }

    return _getResult
}

export default useCropperResult
