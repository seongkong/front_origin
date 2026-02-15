import type { Region, Revision } from '../types/metadata'
import { useApp } from '../context/AppContext'

/** 선택된 도면의 공종 목록 + 선택된 공종의 리비전 목록 */
export function DisciplineList() {
  const { normalized, selection, selectDiscipline, selectRevision } = useApp()

  if (!normalized || !selection.drawingId) return null

  const drawing = normalized.drawingsById[selection.drawingId]
  if (!drawing?.disciplines) return null

  const disciplineKeys = Object.keys(drawing.disciplines).sort()
  if (disciplineKeys.length === 0) return null

  const selectedDiscipline = selection.disciplineKey
    ? drawing.disciplines[selection.disciplineKey]
    : null

  /** 공종/region에서 쓸 수 있는 리비전들을 평탄화 (표시용) */
  const revisions: { label: string; revision: Revision }[] = []
  if (selectedDiscipline) {
    if (selectedDiscipline.revisions?.length) {
      selectedDiscipline.revisions.forEach((r) => {
        revisions.push({ label: r.version, revision: r })
      })
    }
    // regions가 메타데이터에서 객체({ A: {...}, B: {...} })로 올 수 있음
    const rawRegions = selectedDiscipline.regions
    const regionList: { name: string; revisions?: Revision[] }[] = Array.isArray(rawRegions)
      ? rawRegions
      : rawRegions && typeof rawRegions === 'object'
        ? Object.entries(rawRegions).map(([key, region]) => ({
            name: (region as Region).name ?? key,
            revisions: (region as Region).revisions,
          }))
        : []
    regionList.forEach((region) => {
      region.revisions?.forEach((r) => {
        revisions.push({ label: `${region.name} ${r.version}`, revision: r })
      })
    })
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">공종</h3>
      <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
        {disciplineKeys.map((key) => (
          <li key={key}>
            <button
              type="button"
              onClick={() => selectDiscipline(key)}
              className={`w-full text-left text-sm px-2 py-1.5 rounded hover:bg-gray-200/80 ${
                selectedDiscipline === drawing.disciplines![key]
                  ? 'font-semibold bg-gray-200 text-gray-900'
                  : 'text-gray-700'
              }`}
            >
              {key}
            </button>
          </li>
        ))}
      </ul>

      {selectedDiscipline && (
        <div className="mt-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">리비전</h3>
          {revisions.length === 0 ? (
            <p className="text-xs text-gray-500">리비전 없음 (기준 도면만)</p>
          ) : (
            <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
              {revisions.map(({ label, revision }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => selectRevision(revision)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded hover:bg-gray-200/80 ${
                      selection.revision?.image === revision.image
                        ? 'font-semibold bg-gray-200 text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {label}
                    {revision.date ? (
                      <span className="ml-1 text-xs text-gray-500">({revision.date})</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
