import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronRight, FiChevronDown, FiFolder, FiFolderPlus, FiTrash2 } from 'react-icons/fi'
import { Folder } from '../../types'

interface FolderNodeData extends Folder {
  children: FolderNodeData[]
}

function buildTree(folders: Folder[]): FolderNodeData[] {
  const map = new Map<string, FolderNodeData>()
  const roots: FolderNodeData[] = []

  for (const f of folders) {
    map.set(f._id, { ...f, children: [] })
  }
  for (const f of folders) {
    const node = map.get(f._id)!
    if (f.parentFolder && map.has(f.parentFolder)) {
      map.get(f.parentFolder)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

interface FolderTreeProps {
  folders: Folder[]
  currentFolderId?: string
  onSelect: (folderId: string | undefined) => void
  onCreateFolder?: (parentId?: string) => void
  onDeleteFolder?: (folderId: string) => void
}

function FolderNode({ folder, currentFolderId, onSelect, onCreateFolder, onDeleteFolder, level }: {
  folder: FolderNodeData
  currentFolderId?: string
  onSelect: (folderId: string | undefined) => void
  onCreateFolder?: (parentId?: string) => void
  onDeleteFolder?: (folderId: string) => void
  level: number
}) {
  const [expanded, setExpanded] = useState(
    currentFolderId ? isAncestor(folder, currentFolderId) : level < 1
  )
  const hasChildren = folder.children.length > 0
  const isActive = currentFolderId === folder._id
  const [confirmDelete, setConfirmDelete] = useState(false)

  function isAncestor(f: FolderNodeData, targetId: string): boolean {
    if (f._id === targetId) return true
    return f.children.some(c => isAncestor(c, targetId))
  }

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-all group ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={() => onSelect(folder._id)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {hasChildren ? (
            expanded ? <FiChevronDown className="h-3.5 w-3.5" /> : <FiChevronRight className="h-3.5 w-3.5" />
          ) : (
            <span className="w-3.5" />
          )}
        </button>
        <FiFolder className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
        <span className="truncate flex-1">{folder.name}</span>
        {onDeleteFolder && !confirmDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
            title="Delete folder"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        )}
        {confirmDelete && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteFolder?.(folder._id); setConfirmDelete(false) }}
              className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false) }}
              className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              No
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
              {folder.children.map(child => (
                <FolderNode
                  key={child._id}
                  folder={child}
                  currentFolderId={currentFolderId}
                  onSelect={onSelect}
                  onCreateFolder={onCreateFolder}
                  onDeleteFolder={onDeleteFolder}
                  level={level + 1}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FolderTree({ folders, currentFolderId, onSelect, onCreateFolder, onDeleteFolder }: FolderTreeProps) {
  const tree = useMemo(() => buildTree(folders), [folders])

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Folders</span>
        {onCreateFolder && (
          <button
            onClick={() => onCreateFolder(currentFolderId)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="New folder"
          >
            <FiFolderPlus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer text-sm transition-all ${
          !currentFolderId
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onClick={() => onSelect(undefined)}
      >
        <FiFolder className="h-4 w-4" />
        <span>All Files</span>
      </div>

      {tree.map(folder => (
        <FolderNode
          key={folder._id}
          folder={folder}
          currentFolderId={currentFolderId}
          onSelect={onSelect}
          onCreateFolder={onCreateFolder}
          onDeleteFolder={onDeleteFolder}
          level={0}
        />
      ))}
    </div>
  )
}
