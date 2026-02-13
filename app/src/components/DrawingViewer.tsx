import { useMemo } from 'react'
import { useApp } from '../context/AppContext'

/**
 * 3단계: 선택된 도면 이미지를 화면에 표시
 * - 리비전 선택 시: revision.image
 * - 공종 선택 시: discipline.image 있으면 사용, 없으면 revisions[0].image, 둘 다 없으면 drawing.image
 * - 도면만 선택 시: drawing.image
 */
export function DrawingViewer() {
  const { normalized, selection } = useApp()

  const imagePath = useMemo(() => {
    if (!normalized || !selection.drawingId) return null
    const drawing = normalized.drawingsById[selection.drawingId]
    if (!drawing) return null

    if (selection.revision?.image) {
      return `/data/drawings/${selection.revision.image}`
    }

    if (selection.disciplineKey && drawing.disciplines?.[selection.disciplineKey]) {
      const d = drawing.disciplines[selection.disciplineKey]
      if (d.image) return `/data/drawings/${d.image}`
      if (d.revisions?.length && d.revisions[0].image) {
        return `/data/drawings/${d.revisions[0].image}`
      }
      return `/data/drawings/${drawing.image}`
    }

    return `/data/drawings/${drawing.image}`
  }, [normalized, selection])

  if (!imagePath) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded border border-gray-200">
        <p className="text-gray-500">도면을 선택하세요</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="border border-gray-300 rounded bg-gray-50 overflow-auto min-h-[480px] max-h-[calc(100vh-280px)] flex items-center justify-center p-2">
        <img
          src={imagePath}
          alt={selection.drawingId ? `도면 ${selection.drawingId}` : '도면'}
          className="max-w-full max-h-[calc(100vh-320px)] object-contain block"
        />
      </div>
      <p className="text-xs text-gray-500">이미지: {imagePath.split('/').pop()}</p>
    </div>
  )
}
