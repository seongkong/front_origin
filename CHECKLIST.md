# README 요구사항 점검 (자체 점검)

루트 `README.md` 기준으로 구현 상태를 점검한 결과입니다.

---

## 1. 필수 기능 (README § 요구사항)

| 기능 | 설명 | 상태 | 비고 |
|------|------|------|------|
| **도면 탐색** | 사용자가 원하는 도면을 찾을 수 있어야 함 | ✅ | DrawingTree(계층 트리), DisciplineList(공종→리비전), 사이드바에서 도면/공종/리비전 선택 |
| **도면 표시** | 선택한 도면 이미지를 화면에 표시 | ✅ | DrawingViewer에서 단일 이미지 또는 겹쳐보기(오버레이) 표시 |
| **컨텍스트 인식** | 현재 어떤 도면를 보고 있는지 사용자가 알 수 있어야 함 | ✅ | 메인 영역에 도면명, 공종, 리비전, 변경 내역 표시 |

---

## 2. 제출물 A. 소스 코드

| 항목 | 상태 | 비고 |
|------|------|------|
| `npm run dev`로 실행 가능 | ✅ | 루트: `npm run dev` → `npm run dev --prefix app`. app에서 `npm install` 후 실행 |
| React 18+ 또는 Vue 3+ | ✅ | React 19 사용 |
| TypeScript | ✅ | 전체 TS + `types/metadata.ts` 등 타입 정의 |

※ 루트에서 처음 실행 시: `cd app && npm install && npm run dev` 또는 루트에서 `npm run dev`(app에 node_modules 있어야 함).

---

## 3. 데이터 구조 반영 (README § metadata.json)

| 항목 | 상태 | 비고 |
|------|------|------|
| project (이름, 좌표 단위) | ✅ | 타입 정의·표시(프로젝트명). 단위(px)는 메타데이터에 존재, 코드에서 좌표는 px로 일관 사용 |
| drawings 계층 (parent, position) | ✅ | getChildDrawings, rootDrawings, DrawingTree에서 사용 |
| Drawing (id, name, image, parent, position, disciplines) | ✅ | `types/metadata.ts` 및 전역 상태에서 사용 |
| Position (vertices, imageTransform) | ✅ | 타입 정의됨. 상위 도면 위 polygon 그리기·클릭 이동 구현됨 |
| Discipline (imageTransform, image, polygon, regions, revisions) | ✅ | 타입·DisciplineList·DrawingViewer에서 사용 |
| Region (polygon, revisions) | ✅ | regions가 객체인 경우 Object.entries로 처리(DisciplineList) |
| Revision (version, image, date, description, changes, imageTransform, polygon) | ✅ | 타입·리비전 선택·리비전별 imageTransform 적용 |

---

## 4. imageTransform / relativeTo (README § 두 가지 Transform)

| 항목 | 상태 | 비고 |
|------|------|------|
| relativeTo 기준 도면 반영 | ✅ | 오버레이 시 `relativeTo === baseImageFilename`일 때만 해당 transform 적용 |
| (x, y) 앵커 포인트로 정렬 | ✅ | 등록점 해석: translate(-x,-y) + left: x, top: y로 베이스와 오버레이 (x,y) 일치 |
| scale, rotation (라디안) | ✅ | transform에 반영, transformOrigin 0 0 |
| 리비전별 imageTransform | ✅ | 선택된 공종 레이어는 selection.revision?.imageTransform 사용(주민공동시설 건축 등) |

---

## 5. polygonTransform / 상위 도면 영역

| 항목 | 상태 | 비고 |
|------|------|------|
| polygonTransform 타입 정의 | ✅ | Polygon.polygonTransform (x, y, scale, rotation) |
| 상위 도면 위 하위 영역 그리기·클릭 | ✅ | PROGRESS.md·이전 대화에서 “넘어가기”로 합의. DrawingViewer: position.vertices로 SVG polygon, 클릭 시 selectDrawing(child) |

---

## 6. 특수 케이스 (README § 특수 케이스)

| 케이스 | 상태 | 비고 |
|--------|------|------|
| region 있는 구조 공종 (101동) | ✅ | DisciplineList에서 regions 객체 → Object.entries로 리비전 평탄화, "Region A REV1A" 등 표시 |
| revision별 polygon/imageTransform 다름 (주민공동시설 건축) | ✅ | 리비전 선택 시 해당 revision의 imageTransform 사용 |
| polygon 없는 공종 (주차장 구조 등) | ✅ | imageTransform만 사용, 오버레이 정상 동작 |

---

## 7. 기타 구현 품질

| 항목 | 상태 | 비고 |
|------|------|------|
| 좌표 단위 px 일관 | ✅ | left/top/translate(px), baseSize 픽셀, rotation(rad)만 별도 |
| 타입 엄격·any 지양 | ✅ | 모든 데이터 타입 인터페이스 정의, any 없음, 단언은 최소(Region, Metadata) |
| 공종 겹쳐보기 + 사이드바 연동 | ✅ | 사이드바 공종 선택 시 겹쳐보기 체크 1개만 선택, 2개 이상 체크 시 오버레이 표시 |

---

## 8. 미완성·선택 사항 정리

- **구현 완료**: 상위 도면에서 하위 도면 영역 polygon 그리기 및 클릭으로 이동 (position.vertices 사용, 뷰포트 fitScale 적용).
- **선택**: 리비전 타임라인 보강.

---

## 요약

- **필수 기능**: 도면 탐색·도면 표시·컨텍스트 인식 모두 구현됨.
- **README 데이터 구조·imageTransform/relativeTo·리비전별 변환·특수 케이스** 반영됨.
- **상위 도면 polygon/클릭** 구현 완료. README 및 요구사항에 맞게 구현된 상태로 판단됨.
