interface TagProps {
  name: string
  color: string
  onRemove?: () => void
  className?: string
}

/**
 * Tag component for displaying a colored tag/label
 */
function Tag({ name, color, onRemove, className = '' }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${className}`}
      style={{ backgroundColor: color, color: '#fff' }}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/20"
          aria-label={`Remove ${name} tag`}
        >
          ×
        </button>
      )}
    </span>
  )
}

export default Tag
