import type { DistanceFilter, KindFilter, LocationFilter, SocialItemWithContext } from '../../types/social.ts'
import { findShortestFriendPath } from '../../utils/friendPath.ts'
import { primaryDemoUserId } from './communityData.ts'
import { friendGraph } from './graphSelectors.ts'
import { socialItems } from './socialData.ts'

const memberById = new Map(friendGraph.nodes.map((member) => [member.id, member]))

export function getSocialItemsWithContext(): SocialItemWithContext[] {
  return socialItems.map((item) => {
    const member = memberById.get(item.personId)
    const path = findShortestFriendPath(friendGraph.links, primaryDemoUserId, item.personId)
    const pathNames = path.path
      .map((memberId) => memberById.get(memberId)?.displayName)
      .filter(Boolean)
      .join(' ← ')

    return {
      ...item,
      personName: member?.displayName ?? 'عضو ناشناس',
      personAvatar: member?.avatarThumbnail ?? '',
      personProfession: member?.profession ?? '',
      distance: path.distance,
      pathNames,
      relationshipContext: relationshipContext(path.distance, pathNames),
    }
  })
}

export function filterSocialItems(
  items: SocialItemWithContext[],
  filters: {
    distance: DistanceFilter
    location: LocationFilter
    kind: KindFilter
  },
) {
  return items.filter((item) => {
    const matchesDistance =
      filters.distance === 'all' || (item.distance !== null && item.distance <= Number(filters.distance))
    const matchesLocation =
      filters.location === 'all' ||
      (filters.location === 'tehran' ? item.city === 'تهران' : item.city !== 'تهران')
    const matchesKind = filters.kind === 'all' || item.kind === filters.kind

    return matchesDistance && matchesLocation && matchesKind
  })
}

function relationshipContext(distance: number | null, pathNames: string) {
  if (distance === null) return 'مسیر ارتباطی مشخصی با شما پیدا نشد'
  if (distance === 0) return 'این مورد از طرف خود شماست'
  if (distance === 1) return 'این شخص مستقیماً در شبکه دوستان شماست'

  const names = pathNames.split(' ← ')
  const bridgeName = names[1]

  if (bridgeName) {
    return `از طریق ${bridgeName} به شبکه شما وصل شده`
  }

  return `${toPersianDigits(distance)} ارتباط با شما فاصله دارد`
}

function toPersianDigits(value: number) {
  return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value)
}
