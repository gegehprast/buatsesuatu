import { create } from 'zustand'

interface FileState {
    files: File[]
    setFiles: (f: File[]) => void
}

const useFileStore = create<FileState>()((set) => ({
    files: [],
    setFiles: (f) => set(() => ({ files: f })),
}))

export default useFileStore
