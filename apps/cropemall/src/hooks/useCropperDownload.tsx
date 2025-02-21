import { download, getState } from '@/libs/cropper'
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

        const state = getState(
            img.current,
            imgRotation,
            imgBounds,
            cropSize,
            cropPos,
        )

        await download(img.current, state)
    }

    return _download
}

export default useCropperDownload
