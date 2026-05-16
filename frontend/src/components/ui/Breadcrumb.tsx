import { FiChevronRight, FiHome } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  folderId?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  onNavigate: (folderId?: string) => void
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
      <button
        onClick={() => onNavigate(undefined)}
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <FiHome className="h-4 w-4" />
        <span className="hidden sm:inline">My Files</span>
      </button>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <FiChevronRight className="h-3.5 w-3.5" />
          {i === items.length - 1 ? (
            <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[150px]">
              {item.label}
            </span>
          ) : (
            <button
              onClick={() => onNavigate(item.folderId)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[150px]"
            >
              {item.label}
            </button>
          )}
        </span>
      ))}
    </nav>
  )
}
