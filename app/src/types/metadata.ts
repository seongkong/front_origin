export interface ProjectMeta {
  name: string
  unit: string
}

export interface ImageTransform {
  relativeTo?: string
  x: number
  y: number
  scale: number
  rotation: number
}

export interface PolygonTransform {
  x: number
  y: number
  scale: number
  rotation: number
}

export interface Polygon {
  vertices: [number, number][]
  polygonTransform?: PolygonTransform
}

export interface Revision {
  version: string
  image: string
  date: string
  description: string
  changes: string[]
  imageTransform?: ImageTransform
  polygon?: Polygon
}

export interface Region {
  name: string
  polygon: Polygon
  revisions: Revision[]
}

export interface Discipline {
  name?: string
  imageTransform?: ImageTransform
  image?: string
  polygon?: Polygon
  regions?: Region[]
  revisions?: Revision[]
}

export interface DrawingPosition {
  vertices: [number, number][]
  imageTransform?: ImageTransform
}

export interface Drawing {
  id: string
  name: string
  image: string
  parent: string | null
  position: DrawingPosition | null
  disciplines?: Record<string, Discipline>
}

export interface Metadata {
  project: ProjectMeta
  disciplines: { name: string }[]
  drawings: Record<string, Drawing>
}

