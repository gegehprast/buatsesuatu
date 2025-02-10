import { download } from '@/libs/download'
import { CropperContextValue } from '@/contexts/CropperContext'

type UseCropperDownloadProps = Pick<
    CropperContextValue,
    'img' | 'imgSize' | 'cropSize' | 'cropPos' | 'imgPos'
>

const useCropperDownload = ({
    img,
    imgSize,
    cropSize,
    cropPos,
    imgPos,
}: UseCropperDownloadProps) => {
    const _download = () => {
        if (!img.current) return

        download(img.current, imgSize, cropSize, cropPos, imgPos)
    }

    return _download
}

export default useCropperDownload
