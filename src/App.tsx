import { useEffect, useState } from 'react'
import { PrototypeNav } from './components/PrototypeNav.tsx'
import { parsePrototypeInvitationLink } from './data/community/invitationSelectors.ts'
import { InvitePage } from './pages/InvitePage.tsx'
import { InvitationLandingPage } from './pages/InvitationLandingPage.tsx'
import { NetworkGraphPage } from './pages/NetworkGraphPage.tsx'
import { PulsePage } from './pages/PulsePage.tsx'
import { RequestsPage } from './pages/RequestsPage.tsx'
import type { AppSection } from './types/navigation.ts'

export function App() {
  const [currentSection, setCurrentSection] = useState<AppSection>('graph')
  const [invitationRoute, setInvitationRoute] = useState(() => parsePrototypeInvitationLink(window.location.href))

  useEffect(() => {
    function syncInvitationRoute() {
      setInvitationRoute(parsePrototypeInvitationLink(window.location.href))
    }

    window.addEventListener('hashchange', syncInvitationRoute)

    return () => window.removeEventListener('hashchange', syncInvitationRoute)
  }, [])

  function navigate(section: AppSection) {
    if (window.location.hash.startsWith('#/invite/prototype/')) {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`)
      setInvitationRoute(null)
    }

    setCurrentSection(section)
  }

  return (
    <>
      <PrototypeNav currentSection={invitationRoute ? 'invite' : currentSection} onNavigate={navigate} />
      {invitationRoute ? <InvitationLandingPage invitation={invitationRoute} /> : null}
      {!invitationRoute && currentSection === 'graph' ? <NetworkGraphPage /> : null}
      {!invitationRoute && currentSection === 'requests' ? <RequestsPage /> : null}
      {!invitationRoute && currentSection === 'pulse' ? <PulsePage /> : null}
      {!invitationRoute && currentSection === 'invite' ? <InvitePage /> : null}
    </>
  )
}
