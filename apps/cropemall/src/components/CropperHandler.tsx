import { useCropper } from '@/hooks/useCropper'
import { Download, Image, PencilOff } from 'lucide-react'
import React from 'react'

const CropperHandler: React.FC = () => {
    const {
        download,
        reset,
        getResult,
        setActualCropperSize,
        state,
    } = useCropper()

    return (
        <div className="z-10 absolute flex flex-col justify-center gap-2 top-1 left-1">
            <button
                onClick={download}
                title="Download cropped"
                className="rounded transition-colors duration-300 ease-in-out hover:bg-mf-500 cursor-pointer text-white flex items-center justify-center p-1 w-7 h-7"
            >
                <Download width={20} height={20} />
            </button>

            <button
                onClick={reset}
                title="Reset"
                className="rounded transition-colors duration-300 ease-in-out hover:bg-mf-500 cursor-pointer text-white flex items-center justify-center p-1 w-7 h-7"
            >
                <PencilOff width={20} height={20} />
            </button>

            <button
                onClick={getResult}
                title="Get result"
                className="rounded transition-colors duration-300 ease-in-out hover:bg-mf-500 cursor-pointer text-white flex items-center justify-center p-1 w-7 h-7"
            >
                <Image width={20} height={20} />
            </button>

            {/* set actual cropper size */}
            <div className="flex flex-col gap-2">
                <label className="text-white text-xs">Cropper Size</label>

                <div className="flex flex-row gap-2">
                    <input
                        type="number"
                        className="bg-white/50 rounded p-0.5 w-14 text-white text-xs outline-0"
                        placeholder="width"
                        onChange={(e) => {
                            setActualCropperSize((size) => ({
                                width: +e.target.value,
                                height: size.height,
                            }))
                        }}
                        value={Math.round(state.actualCropperSize.width)}
                        step={1}
                    />
                    <input
                        type="number"
                        className="bg-white/50 rounded p-0.5 w-14 text-white text-xs outline-0"
                        placeholder="height"
                        onChange={(e) => {
                            setActualCropperSize((size) => ({
                                width: size.width,
                                height: +e.target.value,
                            }))
                        }}
                        value={Math.round(state.actualCropperSize.height)}
                        step={1}
                    />
                </div>
            </div>
        </div>
    )
}

export default CropperHandler
