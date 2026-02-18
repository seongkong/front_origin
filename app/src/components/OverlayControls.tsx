import { useApp } from '../context/AppContext'

/** 4단계: 공종 겹쳐보기 체크박스 + 투명도 슬라이더 */
export function OverlayControls() {
  const { normalized, selection, overlay, setOverlay, toggleOverlayDiscipline } = useApp()

  if (!normalized || !selection.drawingId) return null
  const drawing = normalized.drawingsById[selection.drawingId]
  if (!drawing?.disciplines) return null

  const keys = Object.keys(drawing.disciplines).sort()
  if (keys.length < 2) return null

  return (
    <div className="flex flex-wrap items-center gap-4 py-2 px-3 bg-white rounded-lg border border-gray-200 shadow-sm">
      <span className="text-sm font-medium text-gray-800">공종 겹쳐보기</span>
      <div className="flex flex-wrap gap-3">
        {keys.map((key) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={overlay.disciplineKeys.includes(key)}
              onChange={() => toggleOverlayDiscipline(key)}
              className="rounded border-gray-300 accent-amber-500"
            />
            <span className="text-sm text-gray-700">{key}</span>
          </label>
        ))}
      </div>
      {overlay.disciplineKeys.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">겹친 레이어 투명도</span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.1"
            value={overlay.opacity}
            onChange={(e) => setOverlay({ opacity: Number(e.target.value) })}
            className="w-24 accent-amber-500"
          />
          <span className="text-xs text-gray-500">{Math.round(overlay.opacity * 100)}%</span>
        </div>
      )}
    </div>
  )
}
