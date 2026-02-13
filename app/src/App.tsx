import { AppLayout } from './components/Layout'
import { DrawingTree } from './components/DrawingTree'
import { DisciplineList } from './components/DisciplineList'
import { useApp } from './context/AppContext'

function App() {
  const { normalized, loading, error, selection } = useApp()

  const sidebar = (
    <>
      <h2 className="text-sm font-semibold text-gray-800 mb-2">프로젝트</h2>
      {loading && <p className="text-sm text-gray-600">메타데이터 로딩 중...</p>}
      {error && <p className="text-sm text-red-600">에러: {error}</p>}
      {!loading && !error && normalized && (
        <>
          <p className="text-sm text-gray-700 mb-3">
            <strong>{normalized.metadata.project.name}</strong>
          </p>
          <DrawingTree />
          <DisciplineList />
        </>
      )}
    </>
  )

  const drawing = selection.drawingId && normalized?.drawingsById
    ? normalized.drawingsById[selection.drawingId]
    : null

  const main = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">도면 정보</h2>
      {loading && <p className="text-gray-600">메타데이터 로딩 중...</p>}
      {error && <p className="text-red-600">에러: {error}</p>}
      {!loading && !error && normalized && (
        <>
          {!selection.drawingId ? (
            <p className="text-gray-500">왼쪽 트리에서 도면을 선택하세요.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">도면:</span>{' '}
                [{drawing?.id}] {drawing?.name}
              </p>
              {selection.disciplineKey && (
                <p className="text-gray-700">
                  <span className="font-medium">공종:</span> {selection.disciplineKey}
                </p>
              )}
              {selection.revision && (
                <p className="text-gray-700">
                  <span className="font-medium">리비전:</span> {selection.revision.version}
                  {selection.revision.date && (
                    <span className="text-gray-500 ml-1">({selection.revision.date})</span>
                  )}
                </p>
              )}
              {selection.revision?.description && (
                <p className="text-gray-600 mt-2">{selection.revision.description}</p>
              )}
              {(selection.revision?.changes?.length ?? 0) > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-gray-800">변경 내역</p>
                  <ul className="list-disc pl-5 text-gray-600 mt-1">
                    {selection.revision!.changes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-gray-500 mt-4 border-t pt-4">
                (3단계에서 선택한 도면 이미지가 여기에 표시됩니다)
              </p>
            </div>
          )}
        </>
      )}
    </>
  )

  return <AppLayout sidebar={sidebar} main={main} />
}

export default App
