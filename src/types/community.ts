export type Gender = 'زن' | 'مرد' | 'غیردودویی'

export type AgeRange = '۱۸ تا ۲۴' | '۲۵ تا ۳۴' | '۳۵ تا ۴۴' | '۴۵ تا ۵۴' | '۵۵ به بالا'

export type IranianCity =
  | 'تهران'
  | 'کرج'
  | 'اصفهان'
  | 'شیراز'
  | 'تبریز'
  | 'مشهد'

export type RelationshipType = 'friend' | 'trusted' | 'sponsor'

export type Member = {
  id: string
  firstName: string
  lastName: string
  displayName: string
  gender: Gender
  ageRange: AgeRange
  city: IranianCity
  profession: string
  bio: string
  avatarFileName: string
  avatarThumbnailFileName: string
  avatarPath: string
  avatarThumbnailPath: string
  verified: boolean
  joinedDate: string
  sponsorId: string | null
  followerCount: number
  followingCount: number
  contributionCount: number
  endorsementCount: number
  skills: string[]
  clusterId: string
}

export type Relationship = {
  id: string
  type: RelationshipType
  fromMemberId: string
  toMemberId: string
  note?: string
}

export type GraphScenario = {
  id: string
  title: string
  memberId: string
  description: string
}

export type GraphNode = {
  id: string
  displayName: string
  avatar: string
  avatarThumbnail: string
  city: IranianCity
  verified: boolean
  profession: string
  clusterId: string
  isPrimaryDemoUser: boolean
}

export type GraphLink = {
  id: string
  source: string
  target: string
  type: RelationshipType
}

export type GraphData = {
  nodes: GraphNode[]
  links: GraphLink[]
}
