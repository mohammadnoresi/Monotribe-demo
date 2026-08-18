export type SocialItemKind = 'event' | 'help' | 'companionship' | 'offer'

export type UrgencyLevel = 'آرام' | 'امروز' | 'فوری'

export type SocialItem = {
  id: string
  kind: SocialItemKind
  title: string
  personId: string
  city: string
  location: string
  dateLabel: string
  category: string
  neededCount?: number
  participantCount?: number
  urgency?: UrgencyLevel
  description: string
  actionLabel: string
}

export type SocialItemWithContext = SocialItem & {
  personName: string
  personAvatar: string
  personProfession: string
  distance: number | null
  pathNames: string
  relationshipContext: string
}

export type DistanceFilter = 'all' | '1' | '2' | '3' | '5'
export type LocationFilter = 'all' | 'tehran' | 'other'
export type KindFilter = 'all' | SocialItemKind
