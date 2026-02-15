import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { NormalizedMetadata } from '../data/metadata'
import { fetchMetadata, normalizeMetadata } from '../data/metadata'
import type { Revision } from '../types/metadata'

export interface SelectionState {
  drawingId: string | null
  disciplineKey: string | null
  revision: Revision | null
}

/** 4단계: 겹쳐보기에 켜진 공종 키 목록 (같은 도면 내) */
export interface OverlayState {
  disciplineKeys: string[]
  opacity: number
}

interface AppContextValue {
  normalized: NormalizedMetadata | null
  loading: boolean
  error: string | null
  selection: SelectionState
  overlay: OverlayState
  setSelection: (patch: Partial<SelectionState>) => void
  setOverlay: (patch: Partial<OverlayState>) => void
  selectDrawing: (drawingId: string | null) => void
  selectDiscipline: (disciplineKey: string | null) => void
  selectRevision: (revision: Revision | null) => void
  toggleOverlayDiscipline: (key: string) => void
}

const defaultSelection: SelectionState = {
  drawingId: null,
  disciplineKey: null,
  revision: null,
}

const defaultOverlay: OverlayState = {
  disciplineKeys: [],
  opacity: 0.6,
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [normalized, setNormalized] = useState<NormalizedMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selection, setSelectionState] = useState<SelectionState>(defaultSelection)
  const [overlay, setOverlayState] = useState<OverlayState>(defaultOverlay)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const meta = await fetchMetadata()
        if (!cancelled) setNormalized(normalizeMetadata(meta))
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Unknown error')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setSelection = useCallback((patch: Partial<SelectionState>) => {
    setSelectionState((prev) => ({ ...prev, ...patch }))
  }, [])

  const selectDrawing = useCallback((drawingId: string | null) => {
    setSelectionState({
      drawingId,
      disciplineKey: null,
      revision: null,
    })
  }, [])

  const selectDiscipline = useCallback((disciplineKey: string | null) => {
    setSelectionState((prev) => ({
      ...prev,
      disciplineKey,
      revision: null,
    }))
  }, [])

  const selectRevision = useCallback((revision: Revision | null) => {
    setSelectionState((prev) => ({ ...prev, revision }))
  }, [])

  const setOverlay = useCallback((patch: Partial<OverlayState>) => {
    setOverlayState((prev) => ({ ...prev, ...patch }))
  }, [])

  const toggleOverlayDiscipline = useCallback((key: string) => {
    setOverlayState((prev) => {
      const next = prev.disciplineKeys.includes(key)
        ? prev.disciplineKeys.filter((k) => k !== key)
        : [...prev.disciplineKeys, key]
      return { ...prev, disciplineKeys: next }
    })
  }, [])

  useEffect(() => {
    setOverlayState((prev) => ({ ...prev, disciplineKeys: [] }))
  }, [selection.drawingId])

  // 사이드바에서 공종 선택 시 겹쳐보기는 해당 공종만 체크(나머지 해제), 오버레이 보기는 겹쳐보기에서 2개 이상 직접 체크할 때만
  useEffect(() => {
    if (!selection.drawingId) return
    setOverlayState((prev) => ({
      ...prev,
      disciplineKeys: selection.disciplineKey ? [selection.disciplineKey] : [],
    }))
  }, [selection.drawingId, selection.disciplineKey])

  const value = useMemo<AppContextValue>(
    () => ({
      normalized,
      loading,
      error,
      selection,
      overlay,
      setSelection,
      setOverlay,
      selectDrawing,
      selectDiscipline,
      selectRevision,
      toggleOverlayDiscipline,
    }),
    [normalized, loading, error, selection, overlay, setSelection, setOverlay, selectDrawing, selectDiscipline, selectRevision, toggleOverlayDiscipline]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
