# 건설 도면 탐색 프로토타입 — 진행 기록

작업할 때마다 변경 사항·중요 사항을 여기에 기록합니다.

---

## 전체 단계 요약

| 단계 | 내용 | 상태 |
|------|------|------|
| **1단계** | 프로젝트 환경 설정 및 데이터 정규화 | ✅ 완료 |
| **2단계** | 도면 탐색 UI (Sidebar/Navigator) | ✅ 완료 |
| **3단계** | 도면 뷰어 및 좌표 변환 (Main Viewer) | ⬜ 예정 |
| **4단계** | 리비전 비교 및 변경 이력 (Feature) | ⬜ 예정 |

---

## 1단계: 프로젝트 환경 설정 및 데이터 정규화 — 완료

### 한 일

- **프로젝트 세팅**
  - `app/` 폴더에 Vite + React 18+ + TypeScript 프로젝트 생성
  - `npm install` 후 `npm run dev`로 실행 가능

- **Tailwind CSS**
  - Tailwind v4 + `@tailwindcss/postcss` 설치
  - `postcss.config.js`: `@tailwindcss/postcss` 사용
  - `src/index.css`: `@import "tailwindcss";` 한 줄로 적용
  - 레이아웃·App 스타일을 Tailwind 유틸 클래스로 작성

- **타입 정의** (`src/types/metadata.ts`)
  - `Metadata`, `Drawing`, `Discipline`, `Region`, `Revision`, `ImageTransform`, `PolygonTransform`, `Polygon`, `DrawingPosition` 등 인터페이스 정의

- **데이터 로딩·정규화** (`src/data/metadata.ts`)
  - `fetchMetadata()`: `/data/metadata.json` fetch
  - `normalizeMetadata()`: `drawingsById`, `rootDrawings` 생성

- **UI 구조**
  - `src/components/Layout.tsx`: `AppLayout` (헤더 / 사이드바 / 메인) — Tailwind로 스타일
  - `App.tsx`: 메타데이터 로드 후 프로젝트명, 루트 도면 목록 등 표시

- **실행·개발 환경**
  - 루트 `package.json`: `npm run dev` → `npm run dev --prefix app` (루트에서 실행 가능)
  - `vite.config.ts`: 상위 `data/` 폴더를 `/data`로 서빙하는 커스텀 플러그인 (`serve-parent-data`), `server.fs.allow: ['..']`
  - `server.port: 5173`, `server.open: true` — 브라우저 자동 오픈

- **기타**
  - PowerShell 실행 정책 이슈: `npm.cmd run dev` 또는 `Set-ExecutionPolicy Bypass -Scope Process` 후 `npm run dev` 사용

### 디렉터리 구조 (관련 부분만)

```
front_origin/
├── package.json          # 루트: dev/build/preview 스크립트
├── PROGRESS.md           # 이 파일
├── data/
│   ├── metadata.json
│   └── drawings/
└── app/
    ├── package.json
    ├── vite.config.ts
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── index.css
    │   ├── main.tsx
    │   ├── App.tsx
    │   ├── types/metadata.ts
    │   ├── data/metadata.ts
    │   └── components/Layout.tsx
    └── public/            # data는 상위 data/ 서빙으로 복사 불필요
```

---

## 2단계: 도면 탐색 UI (Sidebar/Navigator) — 완료

### 한 일

- **전역 상태 (Context API)**
  - `src/context/AppContext.tsx`: 메타데이터(`normalized`) + 선택 상태(`drawingId`, `disciplineKey`, `revision`) 제공
  - `selectDrawing`, `selectDiscipline`, `selectRevision`로 사이드바·메인 연동

- **트리 구조**
  - `src/data/metadata.ts`: `getChildDrawings(drawingsById, parentId)` 추가 — 하위 도면 목록 반환
  - `src/components/DrawingTree.tsx`: 루트부터 계층 트리, 펼치기/접기, 클릭 시 도면 선택

- **필터 흐름 (건물 → 공종 → 리비전)**
  - `src/components/DisciplineList.tsx`: 선택된 도면의 공종 목록 → 공종 선택 시 해당 공종의 리비전 목록 표시 (region 포함 시 "Region A REV1" 형태)

- **연동**
  - `main.tsx`: `AppProvider`로 앱 래핑
  - `App.tsx`: `useApp()`으로 Context 사용, 사이드바에 `DrawingTree` + `DisciplineList`, 메인에 선택된 도면/공종/리비전 요약 및 변경 내역 표시
  - 사이드바 너비 `w-64` → `w-72`로 조정

---

## 3단계: 도면 뷰어 및 좌표 변환 — 예정

- 이미지 렌더링, imageTransform 오버레이, polygon 하이라이트 등

---

## 4단계: 리비전 비교 및 변경 이력 — 예정

- 리비전 타임라인, 공종 중첩(Overlay) 등

---

## 변경 이력 (작업할 때마다 추가)

| 날짜 | 내용 |
|------|------|
| (최초) | 1단계 완료. PROGRESS.md 생성, 단계별 요약 및 1단계 상세 기록. |
| (2단계) | AppContext 추가, DrawingTree·DisciplineList 구현, 건물→공종→리비전 탐색 흐름 및 선택 상태 메인 영역 연동. PROGRESS.md 2단계 완료 반영. |
