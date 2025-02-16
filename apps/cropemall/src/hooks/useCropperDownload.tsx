import { download } from '@/libs/download'
import { CropperContextValue } from '@/contexts/CropperContext'

type UseCropperDownloadProps = Pick<
    CropperContextValue,
    'img' | 'imgSize' | 'imgRotation' | 'cropSize' | 'cropPos' | 'imgPos'
>

const useCropperDownload = ({
    img,
    imgSize,
    imgRotation,
    cropSize,
    cropPos,
    imgPos,
}: UseCropperDownloadProps) => {
    const _download = async () => {
        if (!img.current) return

        await download(img.current, imgSize, imgRotation, cropSize, cropPos, imgPos)
    }

    return _download
}

export default useCropperDownload
