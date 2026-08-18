import type { PulseActivityType, PulseActivityWithContext } from '../../types/pulse.ts'
import { findShortestFriendPath } from '../../utils/friendPath.ts'
import { primaryDemoUserId } from './communityData.ts'
import { friendGraph } from './graphSelectors.ts'
import { pulseActivities } from './pulseData.ts'

const memberById = new Map(friendGraph.nodes.map((member) => [member.id, member]))

const typeLabels: Record<PulseActivityType, string> = {
  'network-growth': 'رشد شبکه',
  'new-connection': 'ارتباط تازه',
  'trust-change': 'تغییر اعتماد',
  event: 'رویداد',
  'help-request': 'درخواست کمک',
  'skill-offer': 'پیشنهاد کمک',
  milestone: 'نقطه عطف',
}

export function getPulseActivitiesWithContext(): PulseActivityWithContext[] {
  return pulseActivities.map((activity) => {
    const primaryPersonId = activity.personIds[0] ?? primaryDemoUserId
    const path = findShortestFriendPath(friendGraph.links, primaryDemoUserId, primaryPersonId)
    const pathNames = path.path
      .map((memberId) => memberById.get(memberId)?.displayName)
      .filter(Boolean)
      .join(' ← ')

    return {
      ...activity,
      typeLabel: typeLabels[activity.type],
      people: activity.personIds.map((memberId) => {
        const member = memberById.get(memberId)

        return {
          id: memberId,
          displayName: member?.displayName ?? 'عضو ناشناس',
          avatar: member?.avatarThumbnail ?? '',
          profession: member?.profession ?? '',
        }
      }),
      distance: path.distance,
      pathMemberIds: path.path,
      pathNames,
      relevance: relevanceText(activity.type, path.distance, pathNames),
    }
  })
}

function relevanceText(type: PulseActivityType, distance: number | null, pathNames: string) {
  if (type === 'milestone') return 'این تغییر به کل شبکه پژوهشی شما مربوط است'
  if (distance === null) return 'مسیر ارتباطی مشخصی با شما پیدا نشد'
  if (distance === 0) return 'این تغییر از نقطه شروع شبکه شما دیده می‌شود'
  if (distance === 1) return 'این تغییر در حلقه مستقیم دوستان شما رخ داده است'

  const bridgeName = pathNames.split(' ← ')[1]
  if (bridgeName) return `چون از طریق ${bridgeName} به شما وصل است، این تغییر برای شما معنا دارد`

  return `${toPersianDigits(distance)} ارتباط با شما فاصله دارد`
}

function toPersianDigits(value: number) {
  return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value)
}
