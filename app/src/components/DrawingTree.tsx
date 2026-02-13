import { useState } from 'react'
import type { Drawing } from '../types/metadata'
import { getChildDrawings } from '../data/metadata'
import { useApp } from '../context/AppContext'

export function DrawingTree() {
  const { normalized, selection, selectDrawing } = useApp()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['00']))

  if (!normalized) return null

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderNode = (drawing: Drawing, depth: number) => {
    const children = getChildDrawings(normalized.drawingsById, drawing.id)
    const hasChildren = children.length > 0
    const isExpanded = expandedIds.has(drawing.id)
    const isSelected = selection.drawingId === drawing.id

    return (
      <div key={drawing.id} className="flex flex-col">
        <div
          className="flex items-center gap-1 py-1 pr-2 rounded cursor-pointer hover:bg-gray-200/80 min-w-0"
          style={{ paddingLeft: depth * 12 + 4 }}
          onClick={() => selectDrawing(drawing.id)}
        >
          <button
            type="button"
            className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 text-xs"
            aria-label={isExpanded ? '접기' : '펼치기'}
            onClick={(e) => {
              e.stopPropagation()
              if (hasChildren) toggle(drawing.id)
            }}
          >
            {hasChildren ? (isExpanded ? '▼' : '▶') : '·'}
          </button>
          <span
            className={`text-sm truncate ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
            title={drawing.name}
          >
            [{drawing.id}] {drawing.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {children.map((c) => renderNode(c, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">도면 트리</h3>
      {normalized.rootDrawings.map((d) => renderNode(d, 0))}
    </div>
  )
}
