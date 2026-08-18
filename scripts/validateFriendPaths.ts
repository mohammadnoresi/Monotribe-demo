import { primaryDemoUserId, relationships } from '../src/data/community/communityData.ts'
import { findShortestFriendPath } from '../src/utils/friendPath.ts'

const friendLinks = relationships
  .filter((relationship) => relationship.type === 'friend')
  .map((relationship) => ({
    id: relationship.id,
    source: relationship.fromMemberId,
    target: relationship.toMemberId,
    type: relationship.type,
  }))

const expectedDistances: Record<string, number> = {
  mt003: 1,
  mt004: 2,
  mt026: 3,
  mt098: 4,
  mt109: 5,
}

const errors: string[] = []

Object.entries(expectedDistances).forEach(([memberId, expectedDistance]) => {
  const result = findShortestFriendPath(friendLinks, primaryDemoUserId, memberId)

  if (result.distance !== expectedDistance) {
    errors.push(`Expected ${memberId} to be ${expectedDistance} links away, got ${result.distance}`)
  }
})

const selfPath = findShortestFriendPath(friendLinks, primaryDemoUserId, primaryDemoUserId)

if (selfPath.distance !== 0 || selfPath.path.join('') !== primaryDemoUserId) {
  errors.push('Expected selecting the primary demo user to return a zero-distance self path')
}

if (errors.length > 0) {
  console.error('Friend path validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Friend path validation passed.')
Object.entries(expectedDistances).forEach(([memberId]) => {
  const result = findShortestFriendPath(friendLinks, primaryDemoUserId, memberId)
  console.log(`- ${memberId}: ${result.distance}`)
})
