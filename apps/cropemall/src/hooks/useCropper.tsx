import { use } from 'react'
import CropperContext from '@/contexts/CropperContext'

export const useCropper = () => {
    return use(CropperContext)
}
