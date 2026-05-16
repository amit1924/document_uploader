import { useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUpload, FiFolder, FiPlus, FiSearch } from 'react-icons/fi'
import { useFiles, useUploadFile, useDeleteFile, useToggleFavorite, useDownloadFile, useRenameFile } from '../hooks/useFiles'
import { useFolders, useCreateFolder, useDeleteFolder } from '../hooks/useFolders'
import FileCard from '../components/ui/FileCard'
import FileTableRow from '../components/ui/FileTableRow'
import { SkeletonCard, SkeletonTableRow } from '../components/ui/SkeletonLoader'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import Breadcrumb from '../components/ui/Breadcrumb'
import ViewToggle from '../components/ui/ViewToggle'
import SearchInput from '../components/ui/SearchInput'
import Modal from '../components/ui/Modal'
import UploadZone from '../components/documents/UploadZone'
import FolderTree from '../components/documents/FolderTree'
import FilePreview from '../components/documents/FilePreview'
import toast from 'react-hot-toast'

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const folderId = searchParams.get('folderId') || undefined
  const category = searchParams.get('category') || undefined
  const search = searchParams.get('search') || undefined
  const viewParam = searchParams.get('view')
  const [view, setView] = useState<'grid' | 'list'>(viewParam === 'list' ? 'list' : 'grid')
  const [page, setPage] = useState(1)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<any>(null)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderSidebarOpen, setFolderSidebarOpen] = useState(false)
  const limit = 12

  const { data: filesData, isLoading } = useFiles({ folder: folderId, category, search, page, limit })
  const { data: folders } = useFolders()
  const uploadMutation = useUploadFile()
  const deleteMutation = useDeleteFile()
  const toggleFavMutation = useToggleFavorite()
  const downloadFile = useDownloadFile()
  const createFolderMutation = useCreateFolder()
  const deleteFolderMutation = useDeleteFolder()
  const renameFile = useRenameFile()
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [renamingFile, setRenamingFile] = useState<{ id: string; name: string } | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const handleSearch = useCallback((val: string) => {
    const params = new URLSearchParams(searchParams)
    if (val) params.set('search', val)
    else params.delete('search')
    params.set('page', '1')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        await uploadMutation.mutateAsync({ file, folder: folderId })
        toast.success(`${file.name} uploaded`)
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('File moved to trash'),
      onError: () => toast.error('Failed to delete file'),
    })
  }

  const handleToggleFav = (id: string) => {
    toggleFavMutation.mutate(id)
  }

  const handleDownload = async (id: string) => {
    const file = filesData?.data.find(f => f._id === id)
    if (!file) return
    try {
      await downloadFile.mutateAsync(file)
    } catch {
      toast.error('Download failed')
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      await createFolderMutation.mutateAsync({ name: newFolderName.trim(), parentFolder: folderId })
      toast.success('Folder created')
      setCreateFolderOpen(false)
      setNewFolderName('')
    } catch {
      toast.error('Failed to create folder')
    }
  }

  const handleFolderNavigate = (id?: string) => {
    const params = new URLSearchParams(searchParams)
    if (id) params.set('folderId', id)
    else params.delete('folderId')
    params.set('page', '1')
    setSearchParams(params)
    setFolderSidebarOpen(false)
  }

  const handleRenameClick = (id: string, currentName: string) => {
    setRenamingFile({ id, name: currentName })
    setRenameValue(currentName)
  }

  const handleRenameSubmit = async () => {
    if (!renamingFile || !renameValue.trim()) return
    try {
      await renameFile.mutateAsync({ fileId: renamingFile.id, originalName: renameValue.trim() })
      setRenamingFile(null)
      setRenameValue('')
    } catch {
      toast.error('Failed to rename file')
    }
  }

  const breadcrumbItems = (() => {
    if (!folders || !folderId) return []
    const folderMap = new Map(folders.map(f => [f._id, f]))
    const items: { label: string; folderId: string }[] = []
    let current = folderMap.get(folderId)
    while (current) {
      items.unshift({ label: current.name, folderId: current._id })
      current = current.parentFolder ? folderMap.get(current.parentFolder) : undefined
    }
    return items
  })()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFolderSidebarOpen(!folderSidebarOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <FiFolder className="h-5 w-5" />
          </button>
          <Breadcrumb items={breadcrumbItems} onNavigate={handleFolderNavigate} />
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
          <button
            onClick={() => setCreateFolderOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="New folder"
          >
            <FiPlus className="h-5 w-5" />
          </button>
          <button
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <FiUpload className="h-4 w-4" /> Upload
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-20">
            <FolderTree
              folders={folders || []}
              currentFolderId={folderId}
              onSelect={handleFolderNavigate}
              onCreateFolder={() => setCreateFolderOpen(true)}
              onDeleteFolder={(id) => deleteFolderMutation.mutate(id)}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <SearchInput
              value={search || ''}
              onChange={handleSearch}
              placeholder="Search in current folder..."
            />
          </div>

          {isLoading ? (
            view === 'grid' ? <SkeletonCard /> : <SkeletonTableRow />
          ) : filesData && filesData.data && filesData.data.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filesData.data.map((file, i) => (
                    <FileCard
                      key={file._id}
                      file={file}
                      index={i}
                      onClick={() => setPreviewFile(file)}
                      onToggleFavorite={handleToggleFav}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onRename={handleRenameClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filesData.data.map((file, i) => (
                    <FileTableRow
                      key={file._id}
                      file={file}
                      index={i}
                      onClick={() => setPreviewFile(file)}
                      onToggleFavorite={handleToggleFav}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                      onRename={handleRenameClick}
                    />
                  ))}
                </div>
              )}
              <Pagination
                page={filesData.page}
                totalPages={filesData.totalPages}
                onPageChange={setPage}
              />
            </>
          ) : (
            <EmptyState
              icon={FiSearch}
              title="No files found"
              description={search ? 'Try a different search term' : 'Upload your first file to get started'}
              action={search ? undefined : { label: 'Upload file', onClick: () => setUploadOpen(true) }}
            />
          )}
        </div>
      </div>

      <FilePreview
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Files" size="lg">
        <UploadZone onUpload={handleUpload} folderId={folderId} />
      </Modal>

      <Modal isOpen={createFolderOpen} onClose={() => setCreateFolderOpen(false)} title="Create Folder" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder name</label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setCreateFolderOpen(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleCreateFolder} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Create</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!renamingFile} onClose={() => setRenamingFile(null)} title="Rename File" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New name</label>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new name"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setRenamingFile(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleRenameSubmit} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Rename</button>
          </div>
        </div>
      </Modal>

      {folderSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFolderSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 p-4 shadow-xl overflow-y-auto">
            <FolderTree
              folders={folders || []}
              currentFolderId={folderId}
              onSelect={handleFolderNavigate}
              onCreateFolder={() => { setCreateFolderOpen(true); setFolderSidebarOpen(false) }}
              onDeleteFolder={(id) => deleteFolderMutation.mutate(id)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
