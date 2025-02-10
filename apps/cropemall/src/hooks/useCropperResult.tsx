import { getResult } from '@/libs/download'
import { CropperContextValue } from '@/contexts/CropperContext'

type UseCropperDownloadProps = Pick<
    CropperContextValue,
    | 'img'
    | 'imgSize'
    | 'imgRotation'
    | 'cropSize'
    | 'cropPos'
    | 'imgPos'
    | 'setResult'
>

const useCropperResult = ({
    img,
    imgSize,
    imgRotation,
    cropSize,
    cropPos,
    imgPos,
    setResult,
}: UseCropperDownloadProps) => {
    const _getResult = async () => {
        if (!img.current) return

        const result = await getResult(img.current, imgSize, imgRotation, cropSize, cropPos, imgPos)

        if (!result) return

        setResult(result)

        return result
    }

    return _getResult
}

export default useCropperResult
