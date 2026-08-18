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
  const [focusedGraphMemberId, setFocusedGraphMemberId] = useState<string | null>(null)
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

  function openMemberInGraph(memberId: string) {
    if (window.location.hash.startsWith('#/invite/prototype/')) {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`)
      setInvitationRoute(null)
    }

    setFocusedGraphMemberId(memberId)
    setCurrentSection('graph')
  }

  return (
    <>
      <PrototypeNav currentSection={invitationRoute ? 'invite' : currentSection} onNavigate={navigate} />
      {invitationRoute ? <InvitationLandingPage invitation={invitationRoute} /> : null}
      {!invitationRoute && currentSection === 'graph' ? (
        <NetworkGraphPage focusedMemberId={focusedGraphMemberId} onFocusHandled={() => setFocusedGraphMemberId(null)} />
      ) : null}
      {!invitationRoute && currentSection === 'requests' ? <RequestsPage onOpenMember={openMemberInGraph} /> : null}
      {!invitationRoute && currentSection === 'pulse' ? <PulsePage onOpenMember={openMemberInGraph} /> : null}
      {!invitationRoute && currentSection === 'invite' ? <InvitePage /> : null}
    </>
  )
}
