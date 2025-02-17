import { download } from '@/libs/cropper'
import { CropperContextValue } from '@/contexts/CropperContext'

type UseCropperDownloadProps = Pick<
    CropperContextValue,
    'img' | 'imgRotation' | 'imgBounds' | 'cropSize' | 'cropPos'
>

const useCropperDownload = ({
    img,
    imgRotation,
    imgBounds,
    cropSize,
    cropPos,
}: UseCropperDownloadProps) => {
    const _download = async () => {
        if (!img.current) return

        await download(img.current, imgRotation, imgBounds, cropSize, cropPos)
    }

    return _download
}

export default useCropperDownload
