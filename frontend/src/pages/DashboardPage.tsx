import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUpload, FiFile, FiHardDrive, FiUsers, FiFileText, FiImage, FiArchive, FiDownload, FiEye } from 'react-icons/fi'
import { useStorageStats, useFiles, useUploadFile, useDownloadFile } from '../hooks/useFiles'
import { formatBytes, formatDate } from '../utils/format'
import StatCard from '../components/ui/StatCard'
import { SkeletonStats } from '../components/ui/SkeletonLoader'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import UploadZone from '../components/documents/UploadZone'
import FilePreview from '../components/documents/FilePreview'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStorageStats()
  const { data: recentFiles, isLoading: filesLoading } = useFiles({ limit: 5 })
  const uploadMutation = useUploadFile()
  const downloadFile = useDownloadFile()
  const navigate = useNavigate()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<any>(null)

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await uploadMutation.mutateAsync({ file })
    }
  }

  const handleDownload = async (id: string) => {
    const file = recentFiles?.data?.find(f => f._id === id)
    if (!file) return
    try {
      await downloadFile.mutateAsync(file)
    } catch {
      toast.error('Download failed')
    }
  }

  const fileTypeDistribution = stats ? [
    { label: 'Documents', value: stats.byCategory.document || 0, icon: FiFileText, color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' },
    { label: 'Images', value: stats.byCategory.image || 0, icon: FiImage, color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' },
    { label: 'Archives', value: stats.byCategory.archive || 0, icon: FiArchive, color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' },
    { label: 'Other', value: stats.byCategory.other || 0, icon: FiFile, color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30' },
  ] : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your document vault</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <FiUpload className="h-4 w-4" /> Quick Upload
        </button>
      </div>

      {statsLoading ? (
        <SkeletonStats />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiHardDrive} label="Storage Used" value={formatBytes(stats.totalSize)} />
          <StatCard icon={FiFile} label="Total Files" value={stats.totalFiles || 0} colorClass="text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30" />
          <StatCard icon={FiUsers} label="Total Categories" value={stats.byCategory ? Object.keys(stats.byCategory).length : 0} colorClass="text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30" />
          <StatCard icon={FiUpload} label="Files" value={stats.totalFiles || 0} colorClass="text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Uploads</h2>
          {filesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentFiles && recentFiles.data && recentFiles.data.length > 0 ? (
            <div className="space-y-2">
              {recentFiles.data.slice(0, 5).map((file) => (
                <motion.div
                  key={file._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div
                    className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() => setPreviewFile(file)}
                  >
                    <FiFile className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setPreviewFile(file)}>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.originalName}</p>
                    <p className="text-xs text-gray-500">{formatBytes(file.fileSize)}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="View"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(file._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Download"
                    >
                      <FiDownload className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(file.createdAt)}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState title="No files yet" description="Upload your first document to get started" action={{ label: 'Upload file', onClick: () => setUploadOpen(true) }} />
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">File Types</h2>
          {stats ? (
            <div className="space-y-4">
              {fileTypeDistribution.map((type) => {
                const total = fileTypeDistribution.reduce((s, t) => s + t.value, 0) || 1
                const percent = Math.round((type.value / total) * 100)
                return (
                  <div key={type.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${type.color}`}>
                          <type.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{type.label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{type.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${type.color.split(' ')[0].replace('text-', 'bg-')}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Files" size="lg">
        <UploadZone onUpload={handleUpload} />
      </Modal>

      <FilePreview
        file={previewFile}
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={(id) => handleDownload(id)}
      />
    </div>
  )
}
