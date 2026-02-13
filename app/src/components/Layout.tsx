import type { ReactNode } from 'react'

interface AppLayoutProps {
  sidebar: ReactNode
  main: ReactNode
}

export function AppLayout({ sidebar, main }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen font-sans antialiased">
      <header className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h1 className="m-0 text-xl font-semibold text-gray-900">
          건설 도면 탐색 인터페이스
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          metadata.json 기반 도면 탐색 프로토타입
        </p>
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="w-72 shrink-0 border-r border-gray-200 bg-gray-100 p-4 overflow-y-auto">
          {sidebar}
        </aside>
        <main className="flex-1 p-6 overflow-y-auto">
          {main}
        </main>
      </div>
    </div>
  )
}
