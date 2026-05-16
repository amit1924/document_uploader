import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'
import { useDebounce } from '../../hooks/useDebounce'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Search files...', className = '' }: SearchInputProps) {
  const [local, setLocal] = useState(value)
  const debounced = useDebounce(local, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onChange(debounced)
  }, [debounced, onChange])

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
      />
      {local && (
        <button
          onClick={() => { setLocal(''); inputRef.current?.focus() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
