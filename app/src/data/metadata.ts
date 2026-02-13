import type { Drawing, Metadata } from '../types/metadata'

export interface NormalizedMetadata {
  metadata: Metadata
  drawingsById: Record<string, Drawing>
  rootDrawings: Drawing[]
}

/**
 * Load raw metadata.json from public/data.
 *
 * NOTE:
 * - 실제로 실행하려면 `data/metadata.json`을 Vite 프로젝트의 `public/data/metadata.json`으로
 *   복사하거나, dev 서버에서 해당 경로를 서빙하도록 맞춰줘야 합니다.
 */
export async function fetchMetadata(): Promise<Metadata> {
  const response = await fetch('/data/metadata.json')

  if (!response.ok) {
    throw new Error(`Failed to load metadata.json: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as Metadata
}

export function normalizeMetadata(metadata: Metadata): NormalizedMetadata {
  const drawingsById = metadata.drawings

  const rootDrawings = Object.values(drawingsById).filter((drawing) => drawing.parent === null)

  return {
    metadata,
    drawingsById,
    rootDrawings,
  }
}

/** parent를 가리키는 하위 도면 목록 (트리용) */
export function getChildDrawings(
  drawingsById: Record<string, Drawing>,
  parentId: string
): Drawing[] {
  return Object.values(drawingsById)
    .filter((d) => d.parent === parentId)
    .sort((a, b) => a.id.localeCompare(b.id, 'ko'))
}

