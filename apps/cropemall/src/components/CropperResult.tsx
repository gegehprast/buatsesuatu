import { useCropper } from '@/hooks/useCropper'

const CropperResult = () => {
    const { result } = useCropper()

    return (
        <>
            {result && (
                <div className="flex justify-center items-center gap-2 w-full h-[500px] p-4">
                    <img
                        src={result}
                        alt="Result"
                        className="rounded h-full object-contain"
                    />
                </div>
            )}
        </>
    )
}

export default CropperResult
