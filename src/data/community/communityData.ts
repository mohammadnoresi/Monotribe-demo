import type { GraphScenario, Member, Relationship } from '../../types/community.ts'
import {
  avatarFileFor,
  avatarSourceDirectory,
  avatarThumbnailDirectory,
  avatarThumbnailFileFor,
} from './avatarAssignments.ts'
import { memberBlueprints } from './memberBlueprints.ts'

export const primaryDemoUserId = 'mt001'

const skillPool = [
  'گفت‌وگوی حمایتی',
  'معرفی حرفه‌ای',
  'همراهی شهری',
  'مشاوره شغلی',
  'کمک در رویداد',
  'راهنمایی سلامت',
  'ترجمه و نوشتن',
  'طراحی و خلاقیت',
  'کمک فنی',
  'شبکه‌سازی محلی',
]

const clusterLabels: Record<string, string> = {
  'tehran-core': 'حلقه‌ی اولیه تهران',
  startup: 'جامعه‌ی محصول و استارتاپ',
  arts: 'گروه هنر و فرهنگ',
  health: 'حلقه‌ی سلامت و مراقبت',
  karaj: 'شبکه‌ی کرج',
  isfahan: 'شبکه‌ی اصفهان',
  shiraz: 'شبکه‌ی شیراز',
  tabriz: 'شبکه‌ی تبریز',
  mashhad: 'شبکه‌ی مشهد',
}

const genderCounts = {
  زن: 0,
  مرد: 0,
  غیردودویی: 0,
}

export const members: Member[] = memberBlueprints.map(
  ([id, firstName, lastName, gender, ageRange, city, profession, clusterId, sponsorId], index) => {
    const skillOffset = index % skillPool.length
    const avatarFileName = avatarFileFor(gender, genderCounts[gender])
    const avatarThumbnailFileName = avatarThumbnailFileFor(avatarFileName)
    genderCounts[gender] += 1

    return {
      id,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      gender,
      ageRange,
      city,
      profession,
      bio: `${profession} از ${city} و عضو ${clusterLabels[clusterId]}.`,
      avatarFileName,
      avatarThumbnailFileName,
      avatarPath: `${avatarSourceDirectory}/${avatarFileName}`,
      avatarThumbnailPath: `${avatarThumbnailDirectory}/${avatarThumbnailFileName}`,
      verified: index === 0 || index % 11 !== 0,
      joinedDate: joinedDateFor(index),
      sponsorId,
      followerCount: 18 + ((index * 7) % 130),
      followingCount: 12 + ((index * 5) % 95),
      contributionCount: (index * 3) % 28,
      endorsementCount: (index * 4 + 2) % 36,
      skills: [skillPool[skillOffset], skillPool[(skillOffset + 3) % skillPool.length]],
      clusterId,
    }
  },
)

const clusterMemberIds = memberBlueprints.reduce<Record<string, string[]>>((groups, [id, , , , , , , clusterId]) => {
  groups[clusterId] = [...(groups[clusterId] ?? []), id]
  return groups
}, {})

const relationshipKeys = new Set<string>()

function relationshipId(type: Relationship['type'], fromMemberId: string, toMemberId: string) {
  return `${type}-${fromMemberId}-${toMemberId}`
}

function addRelationship(
  relationships: Relationship[],
  type: Relationship['type'],
  fromMemberId: string,
  toMemberId: string,
  note?: string,
) {
  const key = relationshipId(type, fromMemberId, toMemberId)
  if (relationshipKeys.has(key)) return

  relationshipKeys.add(key)
  relationships.push({
    id: key,
    type,
    fromMemberId,
    toMemberId,
    ...(note ? { note } : {}),
  })
}

function addFriend(relationships: Relationship[], fromMemberId: string, toMemberId: string, note?: string) {
  addRelationship(relationships, 'friend', fromMemberId, toMemberId, note)
}

function addTrusted(relationships: Relationship[], fromMemberId: string, toMemberId: string, note?: string) {
  addRelationship(relationships, 'trusted', fromMemberId, toMemberId, note)
}

function addClusterFriendships(relationships: Relationship[], ids: string[]) {
  ids.forEach((memberId, index) => {
    addFriend(relationships, memberId, ids[(index + 1) % ids.length], 'ارتباط حضوری در همان خوشه')

    if (index % 2 === 0) {
      addFriend(relationships, memberId, ids[(index + 2) % ids.length], 'ارتباط نزدیک در همان خوشه')
    }
  })
}

const relationshipSeed: Relationship[] = []

Object.values(clusterMemberIds).forEach((ids) => addClusterFriendships(relationshipSeed, ids))

const bridgeFriendships: Array<[string, string, string]> = [
  ['mt001', 'mt002', 'ارتباط مستقیم کاربری دمو با حلقه اولیه'],
  ['mt001', 'mt003', 'ارتباط مستقیم کاربری دمو با حلقه اولیه'],
  ['mt001', 'mt008', 'ارتباط مستقیم کاربری دمو با پل کسب‌وکار'],
  ['mt008', 'mt025', 'پل میان حلقه اولیه و استارتاپ'],
  ['mt025', 'mt036', 'پل طراحی داخل جامعه استارتاپ'],
  ['mt024', 'mt028', 'پل مالی میان حلقه اولیه و استارتاپ'],
  ['mt014', 'mt043', 'پل موسیقی و هنر'],
  ['mt006', 'mt046', 'پل عکاسی میان حلقه اولیه و هنر'],
  ['mt012', 'mt059', 'پل پزشکی میان حلقه اولیه و سلامت'],
  ['mt010', 'mt061', 'پل ورزش و سلامت'],
  ['mt017', 'mt075', 'پل مددکاری میان تهران و کرج'],
  ['mt048', 'mt087', 'پل فرهنگ میان تهران و اصفهان'],
  ['mt070', 'mt094', 'پل سلامت میان تهران و اصفهان'],
  ['mt057', 'mt099', 'پل رویداد فرهنگی میان تهران و شیراز'],
  ['mt045', 'mt100', 'پل موسیقی میان تهران و شیراز'],
  ['mt036', 'mt098', 'پل تجربه کاربری میان استارتاپ و اصفهان'],
  ['mt098', 'mt109', 'پل طراحی میان اصفهان و تبریز'],
  ['mt030', 'mt114', 'پل فنی میان تهران و تبریز'],
  ['mt017', 'mt115', 'پل اجتماع محلی میان تهران و مشهد'],
  ['mt114', 'mt120', 'پل فنی میان تبریز و مشهد'],
  ['mt078', 'mt108', 'پل سفر و لجستیک میان کرج و شیراز'],
  ['mt087', 'mt095', 'مسیر دوم در شبکه گردشگری اصفهان'],
  ['mt095', 'mt107', 'پل سفر میان اصفهان و شیراز'],
  ['mt097', 'mt117', 'پل مراقبت سالمندی میان اصفهان و مشهد'],
]

bridgeFriendships.forEach(([fromMemberId, toMemberId, note]) => addFriend(relationshipSeed, fromMemberId, toMemberId, note))

const trustedSeed: Array<[string, string, string]> = [
  ['mt002', 'mt001', 'برای تصمیم‌های سخت به او تکیه می‌کند'],
  ['mt003', 'mt001', 'اعتماد عمیق در حلقه اولیه'],
  ['mt008', 'mt001', 'اعتماد در سطح خانواده انتخابی'],
  ['mt005', 'mt003', 'مشورت‌های شخصی و حرفه‌ای'],
  ['mt009', 'mt008', 'معرفی حرفه‌ای قابل اتکا'],
  ['mt011', 'mt003', 'اعتماد در مسائل حساس'],
  ['mt017', 'mt003', 'اعتماد برای موضوعات حمایتی'],
  ['mt019', 'mt012', 'اعتماد پزشکی'],
  ['mt025', 'mt008', 'اعتماد کاری'],
  ['mt027', 'mt025', 'اعتماد به بنیان‌گذار'],
  ['mt029', 'mt036', 'همراه قابل اتکا در طراحی'],
  ['mt031', 'mt009', 'اعتماد منابع انسانی'],
  ['mt035', 'mt011', 'اعتماد حقوقی'],
  ['mt037', 'mt025', 'اعتماد سرمایه‌گذاری خرد'],
  ['mt040', 'mt015', 'اعتماد داده‌ای'],
  ['mt043', 'mt014', 'اعتماد فرهنگی'],
  ['mt045', 'mt014', 'همکاری موسیقی'],
  ['mt047', 'mt018', 'اعتماد خلاقانه'],
  ['mt049', 'mt020', 'اعتماد رسانه‌ای'],
  ['mt057', 'mt043', 'اعتماد رویدادی'],
  ['mt059', 'mt012', 'اعتماد سلامت'],
  ['mt060', 'mt059', 'اعتماد درمانی'],
  ['mt064', 'mt068', 'اعتماد در موقعیت فوری'],
  ['mt067', 'mt059', 'اعتماد داوطلبانه'],
  ['mt071', 'mt065', 'اعتماد سلامت روان'],
  ['mt073', 'mt070', 'اعتماد مدیریتی'],
  ['mt075', 'mt017', 'اعتماد اجتماعی'],
  ['mt081', 'mt023', 'اعتماد خانوادگی'],
  ['mt083', 'mt081', 'اعتماد آموزشی'],
  ['mt087', 'mt048', 'اعتماد فرهنگی'],
  ['mt091', 'mt087', 'اعتماد گردشگری'],
  ['mt094', 'mt070', 'اعتماد پزشکی بین‌شهری'],
  ['mt098', 'mt036', 'اعتماد طراحی سرویس'],
  ['mt099', 'mt057', 'اعتماد رویداد'],
  ['mt101', 'mt048', 'اعتماد ادبی'],
  ['mt103', 'mt094', 'اعتماد پزشکی'],
  ['mt107', 'mt095', 'اعتماد سفر'],
  ['mt109', 'mt098', 'اعتماد طراحی'],
  ['mt114', 'mt030', 'اعتماد فنی'],
  ['mt115', 'mt017', 'اعتماد اجتماع محلی'],
  ['mt117', 'mt097', 'اعتماد مراقبتی'],
  ['mt120', 'mt114', 'اعتماد فنی'],
  ['mt021', 'mt001', 'مسیر اعتماد جدا از اسپانسر'],
  ['mt022', 'mt001', 'مسیر اعتماد جدا از اسپانسر'],
  ['mt001', 'mt002', 'اعتماد دوطرفه در حلقه نزدیک دمو'],
  ['mt001', 'mt003', 'اعتماد دوطرفه در حلقه نزدیک دمو'],
  ['mt001', 'mt008', 'اعتماد دوطرفه برای موقعیت‌های حساس'],
  ['mt001', 'mt012', 'اعتماد یک‌طرفه برای راهنمایی سلامت'],
  ['mt001', 'mt017', 'اعتماد یک‌طرفه برای حمایت اجتماعی'],
  ['mt001', 'mt021', 'اعتماد دوطرفه جدا از رابطه معرفی'],
  ['mt001', 'mt022', 'اعتماد دوطرفه جدا از رابطه معرفی'],
  ['mt003', 'mt005', 'اعتماد دوطرفه برای مشورت شخصی'],
  ['mt003', 'mt012', 'پل اعتماد میان حلقه اولیه و سلامت'],
  ['mt008', 'mt009', 'اعتماد دوطرفه حرفه‌ای'],
  ['mt008', 'mt025', 'پل اعتماد میان حلقه اولیه و استارتاپ'],
  ['mt012', 'mt019', 'اعتماد دوطرفه پزشکی'],
  ['mt012', 'mt059', 'پل اعتماد سلامت'],
  ['mt014', 'mt043', 'پل اعتماد فرهنگی'],
  ['mt017', 'mt075', 'اعتماد دوطرفه اجتماعی'],
  ['mt017', 'mt115', 'پل اعتماد اجتماع محلی'],
  ['mt023', 'mt081', 'اعتماد مراقبتی خانوادگی'],
  ['mt025', 'mt027', 'اعتماد دوطرفه کاری'],
  ['mt025', 'mt036', 'پل اعتماد طراحی و محصول'],
  ['mt030', 'mt114', 'اعتماد دوطرفه فنی'],
  ['mt036', 'mt029', 'اعتماد دوطرفه در طراحی'],
  ['mt036', 'mt098', 'پل اعتماد تجربه کاربری'],
  ['mt043', 'mt057', 'اعتماد دوطرفه رویدادی'],
  ['mt043', 'mt048', 'پل اعتماد هنر و فرهنگ'],
  ['mt048', 'mt087', 'اعتماد دوطرفه فرهنگی'],
  ['mt048', 'mt101', 'پل اعتماد ادبی'],
  ['mt057', 'mt099', 'پل اعتماد رویدادهای فرهنگی'],
  ['mt059', 'mt060', 'اعتماد دوطرفه درمانی'],
  ['mt059', 'mt067', 'پل اعتماد داوطلبانه'],
  ['mt061', 'mt071', 'پل اعتماد سلامت روان'],
  ['mt070', 'mt073', 'پل اعتماد مدیریتی'],
  ['mt070', 'mt094', 'اعتماد دوطرفه پزشکی بین‌شهری'],
  ['mt075', 'mt082', 'پل اعتماد محله‌ای'],
  ['mt080', 'mt084', 'پل اعتماد برای همراهی شهری'],
  ['mt081', 'mt083', 'پل اعتماد آموزشی'],
  ['mt087', 'mt095', 'پل اعتماد گردشگری'],
  ['mt087', 'mt098', 'پل اعتماد میان اصفهان و استارتاپ'],
  ['mt095', 'mt107', 'پل اعتماد سفر'],
  ['mt098', 'mt109', 'اعتماد دوطرفه طراحی'],
  ['mt114', 'mt120', 'اعتماد دوطرفه فنی'],
  ['mt115', 'mt119', 'پل اعتماد اجتماع محلی'],
]

trustedSeed.forEach(([fromMemberId, toMemberId, note]) => addTrusted(relationshipSeed, fromMemberId, toMemberId, note))

members.forEach((member) => {
  if (member.sponsorId) {
    addRelationship(relationshipSeed, 'sponsor', member.sponsorId, member.id, 'رابطه تاریخی دعوت')
  }
})

export const relationships: Relationship[] = relationshipSeed

export const graphScenarios: GraphScenario[] = [
  {
    id: 'distance-1-friend',
    title: 'یک لینک دوستی',
    memberId: 'mt003',
    description: 'نگار مستقیما با اکانت شما دوست است و برای نمایش ارتباط درجه یک مناسب است.',
  },
  {
    id: 'distance-2-friend',
    title: 'دو لینک دوستی',
    memberId: 'mt004',
    description: 'مانی از مسیر سارا ← هومن ← مانی در فاصله دو لینک دوستی قرار دارد.',
  },
  {
    id: 'distance-3-friend',
    title: 'سه لینک دوستی',
    memberId: 'mt026',
    description: 'سینا از مسیر سارا ← آرش ← لیلا ← سینا به اکانت شما وصل می‌شود.',
  },
  {
    id: 'distance-4-friend',
    title: 'چهار لینک دوستی',
    memberId: 'mt098',
    description: 'مانیسا از مسیر سارا ← آرش ← لیلا/طراحان استارتاپ ← طراح سرویس ← مانیسا قابل توضیح است.',
  },
  {
    id: 'notable-bridge',
    title: 'پل قابل مشاهده میان دو بخش شبکه',
    memberId: 'mt109',
    description: 'آیلین از طریق مانیسا، پل طراحی میان اصفهان و تبریز، به بخش دیگری از شبکه وصل می‌شود.',
  },
  {
    id: 'sponsor-path-differs',
    title: 'مسیر اسپانسر متفاوت از مسیر دوستی',
    memberId: 'mt021',
    description: 'ترانه از نظر اسپانسر از مسیر هنری آمده، اما در اعتماد و دوستی به حلقه اولیه هم نزدیک است.',
  },
  {
    id: 'trusted-by-many',
    title: 'عضوی که چند نفر به او اعتماد دارند',
    memberId: 'mt001',
    description: 'سارا توسط چند عضو حلقه اولیه مورد اعتماد است و برای توضیح مفهوم معتمد مناسب است.',
  },
]

function joinedDateFor(index: number) {
  const month = String((index % 12) + 1).padStart(2, '0')
  const day = String(((index * 3) % 27) + 1).padStart(2, '0')

  return `2025-${month}-${day}`
}
