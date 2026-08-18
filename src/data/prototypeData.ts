import type { PrototypeDataSeed } from '../types/prototype.ts'
import { members, primaryDemoUserId, relationships } from './community/communityData.ts'

export const prototypeDataSeed: PrototypeDataSeed = {
  primaryDemoUserId,
  members,
  relationships,
}
