import type { Member, Relationship } from '../../types/community.ts'
import { members, primaryDemoUserId, relationships } from './communityData.ts'

export type TrustProfileContext = {
  member: Member
  sponsor: Member | null
  realWorldConnectionCount: number
  trustedByCount: number
  endorsements: string[]
  socialActivities: string[]
  relationshipActions: RelationshipAction[]
}

export type RelationshipAction = {
  id: 'friend' | 'trusted' | 'follow'
  label: string
  description: string
}

const memberById = new Map(members.map((member) => [member.id, member]))

const endorsementExamples = [
  'در کار تیمی قابل اعتماد است',
  'برای آموزش زبان کمک کرده',
  'همیشه در فعالیت‌های اجتماعی مشارکت می‌کند',
  'در موقعیت‌های سخت آرام و پیگیر است',
  'برای معرفی حرفه‌ای با مسئولیت رفتار می‌کند',
  'در برنامه‌ریزی دورهمی‌ها همراه قابل اتکایی است',
]

const activityExamples = [
  'شرکت در یک دورهمی کوچک اعضا',
  'کمک به یک عضو دیگر برای هماهنگی کار روزمره',
  'برگزاری یک جلسه آموزشی کوتاه',
  'معرفی یک عضو به فرصت شغلی مناسب',
  'همراهی در یک درخواست کمک غیراضطراری',
  'مشارکت در گفت‌وگوی گروهی محله',
]

export const relationshipActions: RelationshipAction[] = [
  {
    id: 'friend',
    label: 'دوست',
    description: 'این شخص را در دنیای واقعی می‌شناسم',
  },
  {
    id: 'trusted',
    label: 'معتمد',
    description: 'این شخص کسی است که می‌توانم روی او حساب کنم',
  },
  {
    id: 'follow',
    label: 'دنبال کردن',
    description: 'مطالب این شخص برایم جالب است',
  },
]

export function getTrustProfileContext(memberId: string): TrustProfileContext {
  const member = memberById.get(memberId) ?? memberById.get(primaryDemoUserId)!

  return {
    member,
    sponsor: member.sponsorId ? memberById.get(member.sponsorId) ?? null : null,
    realWorldConnectionCount: countFriendRelationships(member.id),
    trustedByCount: countIncomingRelationships(member.id, 'trusted'),
    endorsements: selectExamples(endorsementExamples, member.id, 3),
    socialActivities: selectExamples(activityExamples, member.id, 3),
    relationshipActions,
  }
}

function countFriendRelationships(memberId: string) {
  return relationships.filter(
    (relationship) =>
      relationship.type === 'friend' &&
      (relationship.fromMemberId === memberId || relationship.toMemberId === memberId),
  ).length
}

function countIncomingRelationships(memberId: string, type: Relationship['type']) {
  return relationships.filter((relationship) => relationship.type === type && relationship.toMemberId === memberId).length
}

function selectExamples(examples: string[], seed: string, count: number) {
  const start = Number(seed.replace(/\D/g, '')) % examples.length

  return Array.from({ length: count }, (_, index) => examples[(start + index) % examples.length])
}
