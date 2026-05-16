import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiDownload, FiFile, FiCalendar, FiHardDrive, FiTag, FiX, FiFileText } from 'react-icons/fi'
import { FileItem } from '../../types'
import { formatBytes, formatDate } from '../../utils/format'
import { getFileIcon } from '../../utils/constants'
import Modal from '../ui/Modal'
import CategoryBadge from '../ui/CategoryBadge'
import ImageViewer from '../ui/ImageViewer'

interface FilePreviewProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
  onDownload: (id: string) => void
}

export default function FilePreview({ file, isOpen, onClose, onDownload }: FilePreviewProps) {
  if (!file) return null

  const Icon = getFileIcon(file.mimeType)
  const isImage = file.mimeType.startsWith('image/')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-h-[400px] bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
          {isImage ? (
            <ImageViewer fileId={file._id} alt={file.originalName} className="max-h-[70vh] max-w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <Icon className="h-20 w-20" />
              <p className="text-sm font-medium">Preview not available</p>
            </div>
          )}
        </div>

        <div className="lg:w-80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{file.originalName}</h3>
              <CategoryBadge category={file.category} />
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm">
              <FiHardDrive className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{formatBytes(file.fileSize)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiFileText className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{file.mimeType || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <FiCalendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Added {formatDate(file.createdAt)}</span>
            </div>
            {file.updatedAt !== file.createdAt && (
              <div className="flex items-center gap-3 text-sm">
                <FiCalendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Modified {formatDate(file.updatedAt)}</span>
              </div>
            )}
            {file.tags && file.tags.length > 0 && (
              <div className="flex items-start gap-3 text-sm">
                <FiTag className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex flex-wrap gap-1.5">
                  {file.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onDownload(file._id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <FiDownload className="h-4 w-4" /> Download File
          </button>
        </div>
      </div>
    </Modal>
  )
}
