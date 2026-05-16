import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUploadCloud, FiFile, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../../utils/constants'
import { formatBytes } from '../../utils/format'
import ProgressBar from '../ui/ProgressBar'

interface UploadFile {
  file: File
  preview?: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>
  folderId?: string
}

export default function UploadZone({ onUpload, folderId }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    return () => files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview) })
  }, [files])

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    const newFiles: UploadFile[] = accepted.map(f => ({
      file: f,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
      progress: 0,
      status: 'pending',
    }))

    const rejectedItems = rejected.map(r => ({
      file: r.file,
      progress: 0,
      status: 'error' as const,
      error: r.errors[0]?.message || 'Invalid file',
    }))

    setFiles(prev => [...prev, ...newFiles, ...rejectedItems])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize: MAX_FILE_SIZE,
    maxFiles: 20,
  })

  const handleUpload = async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (!pending.length) return
    setIsUploading(true)

    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' as const } : f))

    for (const pf of pending) {
      try {
        setFiles(prev => prev.map(f => f.file === pf.file ? { ...f, progress: 50 } : f))
        await onUpload([pf.file])
        setFiles(prev => prev.map(f => f.file === pf.file ? { ...f, progress: 100, status: 'success' as const } : f))
      } catch {
        setFiles(prev => prev.map(f => f.file === pf.file ? { ...f, status: 'error' as const, error: 'Upload failed' } : f))
      }
    }

    setIsUploading(false)
  }

  const removeFile = (index: number) => {
    setFiles(prev => {
      const f = prev[index]
      if (f.preview) URL.revokeObjectURL(f.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'))
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-gray-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
            isDragActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <FiUploadCloud className={`h-7 w-7 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to browse'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Max file size: {formatBytes(MAX_FILE_SIZE)} — Supports: PDF, DOCX, Images, TXT, and more
          </p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                {files.some(f => f.status === 'success') && (
                  <button onClick={clearCompleted} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Clear completed
                  </button>
                )}
                {files.some(f => f.status === 'pending') && !isUploading && (
                  <button
                    onClick={handleUpload}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Upload all
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((f, i) => (
                <motion.div
                  key={`${f.file.name}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700"
                >
                  {f.preview ? (
                    <img src={f.preview} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FiFile className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{f.file.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(f.file.size)}</p>
                    {f.status === 'uploading' && <ProgressBar progress={f.progress} showLabel={false} className="mt-1" />}
                    {f.status === 'error' && f.error && (
                      <p className="text-xs text-red-500 mt-0.5">{f.error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {f.status === 'success' && <FiCheckCircle className="h-5 w-5 text-green-500" />}
                    {f.status === 'error' && <FiAlertCircle className="h-5 w-5 text-red-500" />}
                    {f.status === 'pending' && (
                      <button onClick={() => removeFile(i)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <FiX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
