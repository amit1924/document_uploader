import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiGrid, FiFile, FiStar, FiTrash2, FiChevronDown, FiChevronLeft, FiChevronRight,
  FiUpload, FiLogOut, FiUser, FiLock, FiHardDrive, FiFolder
} from 'react-icons/fi'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import { useStorageStats } from '../../hooks/useFiles'
import { FILE_CATEGORIES, CATEGORY_COLORS } from '../../utils/constants'
import { formatBytes } from '../../utils/format'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { path: '/files', label: 'My Files', icon: FiFile },
  { path: '/favorites', label: 'Favorites', icon: FiStar },
  { path: '/files?trash=true', label: 'Trash', icon: FiTrash2 },
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const { user } = useAuthStore()
  const { data: stats } = useStorageStats()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(true)

  const storagePercent = 50

  const isActive = (path: string) => {
    const base = path.split('?')[0]
    return location.pathname === base
  }

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {!collapsed && (
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <FiFolder className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">DocVault</span>
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FiFolder className="h-4 w-4 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {collapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}

          {!collapsed && (
            <>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center justify-between w-full px-3 py-2 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                <span>Categories</span>
                <motion.div animate={{ rotate: categoriesOpen ? 0 : -90 }}>
                  <FiChevronDown className="h-3.5 w-3.5" />
                </motion.div>
              </button>
              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-0.5"
                  >
                    {FILE_CATEGORIES.map((cat) => {
                      const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other
                      const active = location.search === `?category=${cat}`
                      return (
                        <button
                          key={cat}
                          onClick={() => navigate(`/files?category=${cat}`)}
                          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                            active
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="capitalize">{cat}</span>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          {!collapsed && stats && (
            <div className="mb-3 px-3">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <FiHardDrive className="h-3.5 w-3.5" />
                <span>{formatBytes(stats.totalSize)}</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
