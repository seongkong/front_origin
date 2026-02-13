# 건설 도면 탐색 프로토타입 — 진행 기록

작업할 때마다 변경 사항·중요 사항을 여기에 기록합니다.

---

## 전체 단계 요약

| 단계 | 내용 | 상태 |
|------|------|------|
| **1단계** | 프로젝트 환경 설정 및 데이터 정규화 | ✅ 완료 |
| **2단계** | 도면 탐색 UI (Sidebar/Navigator) | ✅ 완료 |
| **3단계** | 도면 뷰어 및 좌표 변환 (Main Viewer) | ✅ 완료 |
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

## 3단계: 도면 뷰어 및 좌표 변환 — 완료

### 한 일

- **도면 이미지 표시 (필수 기능 충족)**
  - `src/components/DrawingViewer.tsx`: 선택된 도면/공종/리비전에 맞는 이미지 경로 결정 후 `<img>`로 표시
  - 이미지 경로 우선순위: `revision.image` → `discipline.image` → `discipline.revisions[0].image` → `drawing.image`
  - App.tsx 메인 영역에 "도면 이미지" 섹션으로 연동

- **이미지 서빙 (vite.config.ts)**
  - `/data` 요청 시 한글 파일명 처리: `decodeURIComponent` 적용
  - 확장자별 Content-Type 설정 (`.json`, `.png`, `.jpeg` 등)
  - 경로 정규화 후 `dataDir` 밖 접근 방지

- **구조(regions) 처리**
  - `DisciplineList.tsx`: 메타데이터에서 `regions`가 **객체**(`{ A: {...}, B: {...} }`)로 오는 경우 처리
  - `Array.isArray(regions)` 아니면 `Object.entries(regions)`로 리비전 목록 생성 → Region A/B 리비전 표시

- **뷰어 UX**
  - 뷰어 영역 `min-h-[480px]` 고정, 이미지 `object-contain`으로 비율 유지하며 영역 안에 맞춤 → 도면 바꿀 때 레이아웃 덜 튐

### 미구현 (선택, 4단계 또는 추후)

- imageTransform 오버레이 (공종별 도면 겹쳐보기)
- polygon 하이라이트 및 클릭 시 해당 도면으로 이동

---

## 4단계: 리비전 비교 및 변경 이력 — 예정

- 리비전 타임라인, 공종 중첩(Overlay) 등

---

## 어려움을 겪었던 부분 / 해결

| 구간 | 어려웠던 점 | 해결 |
|------|-------------|------|
| **실행 환경** | PowerShell에서 `npm run dev` 시 스크립트 실행 정책 오류 | `npm.cmd run dev` 사용 또는 `Set-ExecutionPolicy Bypass -Scope Process` 후 실행. 또는 터미널을 CMD로 변경. |
| **이미지 미표시** | `/data/drawings/한글파일명.png` 요청 시 이미지가 안 나오고 빈 화면 또는 깨진 아이콘 | (1) 요청 URL이 인코딩(`%EC%A3%BC%EB%AF%BC...`)되어 있어 서버에서 파일을 못 찾음 → `decodeURIComponent`로 디코딩 후 경로 매칭. (2) Content-Type이 잘못되면 브라우저가 이미지를 안 그림 → 확장자별 `image/png`, `image/jpeg` 등 설정. |
| **구조 클릭 시 에러** | 101동에서 '구조' 선택 시 `regions?.forEach is not a function`, 화면 하얗게 | 메타데이터에서 `regions`가 배열이 아니라 **객체**(`{ "A": {...}, "B": {...} }`)로 옴. `Array.isArray(regions)` 분기 후, 객체면 `Object.entries(regions)`로 리스트 만들어 리비전 평탄화. |
| **이미지마다 크기 차이** | 도면/공종/리비전 바꿀 때마다 뷰어 영역이 크게 달라짐 | 뷰어 컨테이너에 `min-h-[480px]` 부여, 이미지에 `max-w-full` + `max-h-[...]` + `object-contain` 적용해 비율 유지하며 영역 안에만 맞춤. |

---

## 변경 이력 (작업할 때마다 추가)

| 날짜 | 내용 |
|------|------|
| (최초) | 1단계 완료. PROGRESS.md 생성, 단계별 요약 및 1단계 상세 기록. |
| (2단계) | AppContext 추가, DrawingTree·DisciplineList 구현, 건물→공종→리비전 탐색 흐름 및 선택 상태 메인 영역 연동. PROGRESS.md 2단계 완료 반영. |
| (3단계) | DrawingViewer 추가, 이미지 서빙(URL 디코딩·Content-Type), 구조 regions 객체 처리, 뷰어 영역 고정. PROGRESS.md 3단계 완료 및 어려웠던 부분 정리 반영. |
