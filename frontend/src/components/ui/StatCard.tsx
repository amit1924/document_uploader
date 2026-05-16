import { motion } from 'framer-motion'
import type { IconType } from 'react-icons'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface StatCardProps {
  icon: IconType
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  colorClass?: string
}

export default function StatCard({ icon: Icon, label, value, trend, trendValue, colorClass = 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
          }`}>
            {trend === 'up' ? <FiTrendingUp className="h-3.5 w-3.5" /> : trend === 'down' ? <FiTrendingDown className="h-3.5 w-3.5" /> : null}
            {trendValue}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </motion.div>
  )
}
