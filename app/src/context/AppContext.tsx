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

interface AppContextValue {
  normalized: NormalizedMetadata | null
  loading: boolean
  error: string | null
  selection: SelectionState
  setSelection: (patch: Partial<SelectionState>) => void
  selectDrawing: (drawingId: string | null) => void
  selectDiscipline: (disciplineKey: string | null) => void
  selectRevision: (revision: Revision | null) => void
}

const defaultSelection: SelectionState = {
  drawingId: null,
  disciplineKey: null,
  revision: null,
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [normalized, setNormalized] = useState<NormalizedMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selection, setSelectionState] = useState<SelectionState>(defaultSelection)

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

  const value = useMemo<AppContextValue>(
    () => ({
      normalized,
      loading,
      error,
      selection,
      setSelection,
      selectDrawing,
      selectDiscipline,
      selectRevision,
    }),
    [normalized, loading, error, selection, setSelection, selectDrawing, selectDiscipline, selectRevision]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
