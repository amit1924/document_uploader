import { useState, useEffect } from 'react'
import axiosInstance from '@/api/axios'

interface ImageViewerProps {
  fileId: string
  alt: string
  className?: string
}

export default function ImageViewer({ fileId, alt, className = '' }: ImageViewerProps) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    axiosInstance.get(`/files/${fileId}/view`, { responseType: 'blob' })
      .then((res) => {
        if (!cancelled) setUrl(URL.createObjectURL(res.data))
      })
      .catch(() => {
        axiosInstance.get(`/files/${fileId}/download`, { responseType: 'blob' })
          .then((res) => {
            if (!cancelled) setUrl(URL.createObjectURL(res.data))
          })
          .catch(() => {})
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [fileId])

  if (!url) return null

  return <img src={url} alt={alt} className={className} />
}
