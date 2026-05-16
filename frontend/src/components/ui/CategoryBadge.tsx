import { CATEGORY_COLORS } from '../../utils/constants'

interface CategoryBadgeProps {
  category: string
  className?: string
}

export default function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.other

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: color, color: '#fff' }}
    >
      {category}
    </span>
  )
}
