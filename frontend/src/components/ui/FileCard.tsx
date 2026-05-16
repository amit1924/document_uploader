import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiStar, FiDownload, FiTrash2, FiEdit2, FiMove, FiMoreVertical } from 'react-icons/fi'
import { FileItem } from '../../types'
import { formatBytes, formatDate, truncateFilename } from '../../utils/format'
import { getFileIcon } from '../../utils/constants'
import ImageViewer from './ImageViewer'
import CategoryBadge from './CategoryBadge'

interface FileCardProps {
  file: FileItem
  onToggleFavorite: (id: string, favorite: boolean) => void
  onDelete: (id: string) => void
  onDownload: (id: string) => void
  onRename?: (id: string, name: string) => void
  onMove?: (id: string) => void
  onClick: () => void
  index?: number
}

export default function FileCard({ file, onToggleFavorite, onDelete, onDownload, onRename, onMove, onClick, index = 0 }: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [imgError, setImgError] = useState(false)

  const Icon = getFileIcon(file.mimeType)
  const isImage = file.mimeType.startsWith('image/')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div onClick={onClick} className="cursor-pointer">
        <div className="h-32 bg-gray-50 dark:bg-gray-900 rounded-t-xl flex items-center justify-center relative overflow-hidden">
          {isImage && !imgError ? (
            <ImageViewer fileId={file._id} alt={file.originalName} className="h-full w-full object-cover" />
          ) : (
            <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(file._id, !file.isFavorite) }}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
              file.isFavorite ? 'text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 bg-white/80 dark:bg-gray-800/80'
            }`}
          >
            <FiStar className={`h-4 w-4 ${file.isFavorite ? 'fill-yellow-400' : ''}`} />
          </button>
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1" title={file.originalName}>
              {truncateFilename(file.originalName, 24)}
            </h3>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
              >
                <FiMoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 py-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { onDownload(file._id); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <FiDownload className="h-3.5 w-3.5" /> Download
                  </button>
                      {onRename && (
                    <button onClick={() => { onRename(file._id, file.originalName); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <FiEdit2 className="h-3.5 w-3.5" /> Rename
                    </button>
                  )}
                  {onMove && (
                    <button onClick={() => { onMove(file._id); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <FiMove className="h-3.5 w-3.5" /> Move
                    </button>
                  )}
                  <button onClick={() => { onDelete(file._id); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <FiTrash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <CategoryBadge category={file.category} />
            <span className="text-xs text-gray-400">{formatBytes(file.fileSize)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{formatDate(file.createdAt)}</p>
        </div>
      </div>
    </motion.div>
  )
}
