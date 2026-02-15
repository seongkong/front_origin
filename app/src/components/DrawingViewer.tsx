import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import type { ImageTransform } from '../types/metadata'

function getDisciplineImagePath(
  drawingImage: string,
  disciplineImage?: string,
  revisionImage?: string
): string {
  if (revisionImage) return `/data/drawings/${revisionImage}`
  if (disciplineImage) return `/data/drawings/${disciplineImage}`
  return `/data/drawings/${drawingImage}`
}

/**
 * 3단계: 선택된 도면 이미지 표시
 * 4단계: 겹쳐보기 시 베이스 이미지 + imageTransform 오버레이 레이어
 */
export function DrawingViewer() {
  const { normalized, selection, overlay } = useApp()
  const [baseSize, setBaseSize] = useState<{ w: number; h: number } | null>(null)
  const [fitScale, setFitScale] = useState<number>(1)
  const overlayContainerRef = useRef<HTMLDivElement>(null)

  const onBaseLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setBaseSize({ w: img.naturalWidth, h: img.naturalHeight })
  }, [])

  const singleImagePath = useMemo(() => {
    if (!normalized || !selection.drawingId) return null
    const drawing = normalized.drawingsById[selection.drawingId]
    if (!drawing) return null
    if (selection.revision?.image) return `/data/drawings/${selection.revision.image}`
    if (selection.disciplineKey && drawing.disciplines?.[selection.disciplineKey]) {
      const d = drawing.disciplines[selection.disciplineKey]
      return getDisciplineImagePath(
        drawing.image,
        d.image,
        d.revisions?.[0]?.image
      )
    }
    return `/data/drawings/${drawing.image}`
  }, [normalized, selection])

  const overlayMode = useMemo(() => {
    if (!normalized || !selection.drawingId || overlay.disciplineKeys.length < 2)
      return null
    const drawing = normalized.drawingsById[selection.drawingId]
    if (!drawing?.disciplines) return null
    const baseImageFilename = drawing.image
    const basePath = `/data/drawings/${baseImageFilename}`
    const layers: { key: string; src: string; transform?: ImageTransform }[] = []
    for (const key of overlay.disciplineKeys) {
      const d = drawing.disciplines[key]
      if (!d) continue
      const isSelectedDiscipline = selection.disciplineKey === key
      const revisionImage = isSelectedDiscipline && selection.revision?.image
        ? selection.revision.image
        : d.revisions?.[0]?.image
      const src = getDisciplineImagePath(
        drawing.image,
        d.image,
        revisionImage
      )
      // 리비전별 위치 변화: 선택된 공종이면 선택한 리비전의 imageTransform, 아니면 사용 중인 이미지(첫 리비전)의 transform
      const transform = isSelectedDiscipline && selection.revision?.imageTransform != null
        ? selection.revision.imageTransform
        : (d.revisions?.[0]?.imageTransform ?? d.imageTransform)
      layers.push({ key, src, transform })
    }
    return { basePath, baseImageFilename, layers }
  }, [normalized, selection.drawingId, selection.disciplineKey, selection.revision, overlay.disciplineKeys])

  useEffect(() => {
    if (overlayMode) setBaseSize(null)
  }, [overlayMode?.basePath])

  useEffect(() => {
    if (!baseSize || !overlayContainerRef.current) return
    const el = overlayContainerRef.current
    const updateScale = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w <= 0 || h <= 0) return
      const scale = Math.min(w / baseSize.w, h / baseSize.h, 1)
      setFitScale(scale)
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(el)
    return () => observer.disconnect()
  }, [baseSize])

  if (!normalized || !selection.drawingId) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded border border-gray-200">
        <p className="text-gray-500">도면을 선택하세요</p>
      </div>
    )
  }

  const drawing = normalized.drawingsById[selection.drawingId]

  if (overlayMode) {
    const { basePath, baseImageFilename, layers } = overlayMode
    const scale = baseSize ? fitScale : 1
    const wrapperW = baseSize ? baseSize.w * scale : 0
    const wrapperH = baseSize ? baseSize.h * scale : 0
    return (
      <div className="flex flex-col gap-2">
        <div
          ref={overlayContainerRef}
          className="border border-gray-300 rounded bg-gray-50 overflow-hidden min-h-[480px] h-[calc(100vh-280px)] max-h-[calc(100vh-280px)] flex items-center justify-center p-2"
        >
          {baseSize && (
            <div
              className="flex-shrink-0"
              style={{ width: wrapperW, height: wrapperH }}
            >
              <div
                className="relative overflow-visible"
                style={{
                  width: baseSize.w,
                  height: baseSize.h,
                  transform: `scale(${scale})`,
                  transformOrigin: '0 0',
                }}
              >
                <img
                  src={basePath}
                  alt="베이스 도면"
                  className="block"
                  style={{ width: baseSize.w, height: baseSize.h }}
                  onLoad={onBaseLoad}
                />
                {layers.map(({ key, src, transform }) => {
                  // relativeTo가 없거나 기준 도면과 같을 때만 (x,y,scale,rotation) 적용 → 픽셀 오차 없이 맞춤
                  const useTransform =
                    !transform?.relativeTo ||
                    transform.relativeTo === baseImageFilename
                  const x = useTransform ? (transform?.x ?? 0) : 0
                  const y = useTransform ? (transform?.y ?? 0) : 0
                  const s = useTransform ? (transform?.scale ?? 1) : 1
                  const rotation = useTransform ? (transform?.rotation ?? 0) : 0
                  // (x,y) = 등록점: 베이스의 (x,y)와 오버레이 이미지의 (x,y)가 겹치도록 함.
                  // 요소를 (x,y)에 두고, 이미지에 translate(-x,-y)로 오버레이의 (x,y)를 요소 원점으로 이동.
                  return (
                    <img
                      key={key}
                      src={src}
                      alt={`오버레이 ${key}`}
                      className="absolute pointer-events-none"
                      style={
                        useTransform
                          ? {
                              left: x,
                              top: y,
                              width: 'auto',
                              height: 'auto',
                              maxWidth: 'none',
                              transformOrigin: '0 0',
                              transform: `translate(${-x}px, ${-y}px) scale(${s}) rotate(${rotation}rad)`,
                              opacity: overlay.opacity,
                            }
                          : {
                              left: 0,
                              top: 0,
                              width: baseSize.w,
                              height: baseSize.h,
                              objectFit: 'contain',
                              transformOrigin: '50% 50%',
                              transform: `scale(${s}) rotate(${rotation}rad)`,
                              opacity: overlay.opacity,
                            }
                      }
                    />
                  )})}
              </div>
            </div>
          )}
          {!baseSize && (
            <img
              src={basePath}
              alt="베이스 도면"
              className="max-w-full max-h-[calc(100vh-320px)] object-contain"
              onLoad={onBaseLoad}
            />
          )}
        </div>
        <p className="text-xs text-gray-500">
          베이스: {drawing?.image} · 겹침: {overlayMode.layers.map((l) => l.key).join(', ')}
        </p>
      </div>
    )
  }

  if (!singleImagePath) {
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
          src={singleImagePath}
          alt={selection.drawingId ? `도면 ${selection.drawingId}` : '도면'}
          className="max-w-full max-h-[calc(100vh-320px)] object-contain block"
        />
      </div>
      <p className="text-xs text-gray-500">이미지: {singleImagePath.split('/').pop()}</p>
    </div>
  )
}
