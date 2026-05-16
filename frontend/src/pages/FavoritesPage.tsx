import { useState, useCallback } from 'react'
import { useFiles, useUploadFile, useDeleteFile, useToggleFavorite, useDownloadFile } from '../hooks/useFiles'
import FileCard from '../components/ui/FileCard'
import FileTableRow from '../components/ui/FileTableRow'
import { SkeletonCard, SkeletonTableRow } from '../components/ui/SkeletonLoader'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'
import ViewToggle from '../components/ui/ViewToggle'
import SearchInput from '../components/ui/SearchInput'
import FilePreview from '../components/documents/FilePreview'
import { FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function FavoritesPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [previewFile, setPreviewFile] = useState<any>(null)

  const { data: filesData, isLoading } = useFiles({ favorite: true, search: search || undefined, page, limit: 12 })
  const deleteMutation = useDeleteFile()
  const toggleFavMutation = useToggleFavorite()
  const downloadFile = useDownloadFile()

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Favorites</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your starred files</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search favorites..." className="max-w-md" />
        <ViewToggle view={view} onChange={setView} />
      </div>

      {isLoading ? (
        view === 'grid' ? <SkeletonCard /> : <SkeletonTableRow />
      ) : filesData?.data?.length > 0 ? (
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
                />
              ))}
            </div>
          )}
          <Pagination page={filesData.page} totalPages={filesData.totalPages} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState
          icon={FiStar}
          title="No favorites yet"
          description="Star your important files to find them quickly"
        />
      )}

      <FilePreview
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={handleDownload}
      />
    </div>
  )
}
