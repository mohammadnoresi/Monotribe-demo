import { useState } from 'react'
import { PrototypeNav } from './components/PrototypeNav.tsx'
import { NetworkGraphPage } from './pages/NetworkGraphPage.tsx'
import { PulsePage } from './pages/PulsePage.tsx'
import { RequestsPage } from './pages/RequestsPage.tsx'
import type { AppSection } from './types/navigation.ts'

export function App() {
  const [currentSection, setCurrentSection] = useState<AppSection>('graph')

  return (
    <>
      <PrototypeNav currentSection={currentSection} onNavigate={setCurrentSection} />
      {currentSection === 'graph' ? <NetworkGraphPage /> : null}
      {currentSection === 'requests' ? <RequestsPage /> : null}
      {currentSection === 'pulse' ? <PulsePage /> : null}
    </>
  )
}
