import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiStar, FiDownload, FiTrash2, FiEdit2, FiMove, FiMoreVertical } from 'react-icons/fi'
import { FileItem } from '../../types'
import { formatBytes, formatDate } from '../../utils/format'
import { getFileIcon } from '../../utils/constants'
import ImageViewer from './ImageViewer'
import CategoryBadge from './CategoryBadge'

interface FileTableRowProps {
  file: FileItem
  onToggleFavorite: (id: string, favorite: boolean) => void
  onDelete: (id: string) => void
  onDownload: (id: string) => void
  onRename?: (id: string, name: string) => void
  onMove?: (id: string) => void
  onClick: () => void
  index?: number
}

export default function FileTableRow({ file, onToggleFavorite, onDelete, onDownload, onRename, onMove, onClick, index = 0 }: FileTableRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const Icon = getFileIcon(file.mimeType)
  const isImage = file.mimeType.startsWith('image/')

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-100 dark:border-gray-700 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(file._id, !file.isFavorite) }}
        className={`p-1 rounded transition-colors flex-shrink-0 ${
          file.isFavorite ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100'
        }`}
      >
        <FiStar className={`h-4 w-4 ${file.isFavorite ? 'fill-yellow-400' : ''}`} />
      </button>

      <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {isImage ? (
          <ImageViewer fileId={file._id} alt="" className="h-full w-full object-cover" />
        ) : (
          <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.originalName}</p>
      </div>

      <div className="hidden md:block">
        <CategoryBadge category={file.category} />
      </div>

      <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 w-20 text-right">
        {formatBytes(file.fileSize)}
      </div>

      <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400 w-24 text-right">
        {formatDate(file.createdAt)}
      </div>

      <div className="flex-shrink-0 relative">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-all"
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
    </motion.div>
  )
}
