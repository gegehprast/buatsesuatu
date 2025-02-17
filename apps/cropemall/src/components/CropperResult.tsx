import { useCropper } from '@/hooks/useCropper'
import { LucideX } from 'lucide-react'

const CropperResult = () => {
    const { result, setResult } = useCropper()

    return (
        <>
            {result && (
                <div className="relative flex justify-center items-center gap-2 w-full h-[500px] p-4">
                    <img
                        src={result}
                        alt="Result"
                        className="h-full object-contain outline-1 outline-mf-500"
                    />

                    {/* absolute close button */}
                    <button
                        onClick={() => setResult(undefined)}
                        className="absolute top-4 right-4 p-2 rounded-full transition-colors duration-300 ease-in-out text-gray-700 cursor-pointer"
                    >
                        <LucideX size={24} />
                    </button>
                </div>
            )}
        </>
    )
}

export default CropperResult
