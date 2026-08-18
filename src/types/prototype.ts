import type { Member, Relationship } from './community.ts'

export type LandingCopy = {
  title: string
  label: string
  placeholder: string
}

export type PrototypeDataSeed = {
  primaryDemoUserId: string
  members: Member[]
  relationships: Relationship[]
}
