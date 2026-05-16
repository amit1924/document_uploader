import { motion } from 'framer-motion'

interface ProgressBarProps {
  progress: number
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ progress, className = '', showLabel = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress))

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{Math.round(clamped)}%</p>
      )}
    </div>
  )
}
