export type PulseActivityType =
  | 'network-growth'
  | 'new-connection'
  | 'trust-change'
  | 'event'
  | 'help-request'
  | 'skill-offer'
  | 'milestone'

export type PulseSection = 'network' | 'nearby' | 'growth'

export type PulseActivity = {
  id: string
  type: PulseActivityType
  section: PulseSection
  timestampLabel: string
  personIds: string[]
  sponsorId?: string
  city?: string
  description: string
  actionLabel?: string
}

export type PulseActivityWithContext = PulseActivity & {
  typeLabel: string
  people: Array<{
    id: string
    displayName: string
    avatar: string
    profession: string
  }>
  distance: number | null
  pathNames: string
  relevance: string
}
