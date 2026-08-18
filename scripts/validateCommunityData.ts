import { graphScenarios, members, primaryDemoUserId, relationships } from '../src/data/community/communityData.ts'
import {
  avatarFiles,
  avatarSourceDirectory,
  avatarThumbnailDirectory,
  avatarThumbnailFileFor,
} from '../src/data/community/avatarAssignments.ts'
import type { Relationship } from '../src/types/community.ts'
import { existsSync } from 'node:fs'

const errors: string[] = []
const memberIds = new Set(members.map((member) => member.id))

function addError(message: string) {
  errors.push(message)
}

if (!memberIds.has(primaryDemoUserId)) {
  addError(`Primary demo user does not exist: ${primaryDemoUserId}`)
}

if (memberIds.size !== members.length) {
  addError('Member IDs must be unique')
}

members.forEach((member) => {
  if (member.sponsorId && !memberIds.has(member.sponsorId)) {
    addError(`Sponsor not found for ${member.id}: ${member.sponsorId}`)
  }

  if (member.sponsorId === member.id) {
    addError(`Member sponsors themselves: ${member.id}`)
  }
})

const relationshipKeys = new Set<string>()

relationships.forEach((relationship) => {
  if (!memberIds.has(relationship.fromMemberId)) {
    addError(`Relationship ${relationship.id} has unknown fromMemberId: ${relationship.fromMemberId}`)
  }

  if (!memberIds.has(relationship.toMemberId)) {
    addError(`Relationship ${relationship.id} has unknown toMemberId: ${relationship.toMemberId}`)
  }

  if (relationship.fromMemberId === relationship.toMemberId) {
    addError(`Self-relationship found: ${relationship.id}`)
  }

  const duplicateKey = duplicateKeyFor(relationship)
  if (relationshipKeys.has(duplicateKey)) {
    addError(`Duplicate relationship found: ${duplicateKey}`)
  }
  relationshipKeys.add(duplicateKey)
})

members.forEach((member) => {
  if (!member.sponsorId) return

  const hasSponsorRelationship = relationships.some(
    (relationship) =>
      relationship.type === 'sponsor' &&
      relationship.fromMemberId === member.sponsorId &&
      relationship.toMemberId === member.id,
  )

  if (!hasSponsorRelationship) {
    addError(`Missing sponsor relationship for member ${member.id}`)
  }
})

graphScenarios.forEach((scenario) => {
  if (!memberIds.has(scenario.memberId)) {
    addError(`Scenario ${scenario.id} references unknown member: ${scenario.memberId}`)
  }
})

members.forEach((member) => {
  if (!member.avatarFileName) {
    addError(`Member ${member.id} is missing avatarFileName`)
  }

  if (!member.avatarPath.endsWith(member.avatarFileName)) {
    addError(`Member ${member.id} avatarPath does not match avatarFileName`)
  }

  if (member.avatarThumbnailFileName !== avatarThumbnailFileFor(member.avatarFileName)) {
    addError(`Member ${member.id} avatarThumbnailFileName does not match avatarFileName`)
  }

  if (!member.avatarThumbnailPath.endsWith(member.avatarThumbnailFileName)) {
    addError(`Member ${member.id} avatarThumbnailPath does not match avatarThumbnailFileName`)
  }

  if (!existsSync(`${avatarSourceDirectory}/${member.avatarFileName}`)) {
    addError(`Member ${member.id} references missing avatar file: ${member.avatarFileName}`)
  }

  if (!existsSync(`${avatarThumbnailDirectory}/${member.avatarThumbnailFileName}`)) {
    addError(`Member ${member.id} references missing avatar thumbnail: ${member.avatarThumbnailFileName}`)
  }
})

avatarFiles.forEach((avatarFile) => {
  if (!existsSync(`${avatarSourceDirectory}/${avatarFile}`)) {
    addError(`Configured avatar file does not exist: ${avatarFile}`)
  }

  const thumbnailFile = avatarThumbnailFileFor(avatarFile)
  if (!existsSync(`${avatarThumbnailDirectory}/${thumbnailFile}`)) {
    addError(`Configured avatar thumbnail does not exist: ${thumbnailFile}`)
  }
})

relationships
  .filter((relationship) => relationship.type === 'friend')
  .forEach((relationship) => {
    const fromMember = members.find((member) => member.id === relationship.fromMemberId)
    const toMember = members.find((member) => member.id === relationship.toMemberId)

    if (fromMember?.avatarFileName && fromMember.avatarFileName === toMember?.avatarFileName) {
      addError(`Direct friends share an avatar: ${fromMember.id} and ${toMember.id}`)
    }
  })

const cityCounts = countBy(members.map((member) => member.city))
const avatarCounts = countBy(members.map((member) => member.avatarFileName))
const avatarThumbnailCounts = countBy(members.map((member) => member.avatarThumbnailFileName))
const relationshipCounts = countBy(relationships.map((relationship) => relationship.type))
const friendDistanceSamples = ['mt003', 'mt004', 'mt026', 'mt098', 'mt109'].map((memberId) => ({
  memberId,
  distance: friendDistance(primaryDemoUserId, memberId),
}))
const expectedFriendDistances: Record<string, number> = {
  mt003: 1,
  mt004: 2,
  mt026: 3,
  mt098: 4,
  mt109: 5,
}

Object.entries(expectedFriendDistances).forEach(([memberId, expectedDistance]) => {
  const actualDistance = friendDistance(primaryDemoUserId, memberId)
  if (actualDistance !== expectedDistance) {
    addError(`Expected ${memberId} to be ${expectedDistance} friend links away, got ${actualDistance}`)
  }
})

if (errors.length > 0) {
  console.error('Community data validation failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log('Community data validation passed.')
console.log(`Members: ${members.length}`)
console.log(`Friend relationships: ${relationshipCounts.friend ?? 0}`)
console.log(`Trusted relationships: ${relationshipCounts.trusted ?? 0}`)
console.log(`Sponsor relationships: ${relationshipCounts.sponsor ?? 0}`)
console.log('Members per city:')
Object.entries(cityCounts).forEach(([city, count]) => console.log(`- ${city}: ${count}`))
console.log(`Avatar files configured: ${avatarFiles.length}`)
console.log(`Avatar files assigned: ${Object.keys(avatarCounts).length}`)
console.log(`Avatar thumbnails assigned: ${Object.keys(avatarThumbnailCounts).length}`)
console.log('Friend-distance samples from primary demo user:')
friendDistanceSamples.forEach(({ memberId, distance }) => console.log(`- ${memberId}: ${distance ?? 'not connected'}`))

function duplicateKeyFor(relationship: Relationship) {
  if (relationship.type !== 'friend') {
    return `${relationship.type}:${relationship.fromMemberId}->${relationship.toMemberId}`
  }

  return `friend:${[relationship.fromMemberId, relationship.toMemberId].sort().join('<->')}`
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1
    return counts
  }, {})
}

function friendDistance(fromMemberId: string, toMemberId: string) {
  const adjacency = new Map<string, Set<string>>()

  relationships
    .filter((relationship) => relationship.type === 'friend')
    .forEach((relationship) => {
      if (!adjacency.has(relationship.fromMemberId)) adjacency.set(relationship.fromMemberId, new Set())
      if (!adjacency.has(relationship.toMemberId)) adjacency.set(relationship.toMemberId, new Set())
      adjacency.get(relationship.fromMemberId)!.add(relationship.toMemberId)
      adjacency.get(relationship.toMemberId)!.add(relationship.fromMemberId)
    })

  const queue: Array<{ memberId: string; distance: number }> = [{ memberId: fromMemberId, distance: 0 }]
  const visited = new Set<string>([fromMemberId])

  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.memberId === toMemberId) return current.distance

    adjacency.get(current.memberId)?.forEach((nextMemberId) => {
      if (visited.has(nextMemberId)) return
      visited.add(nextMemberId)
      queue.push({ memberId: nextMemberId, distance: current.distance + 1 })
    })
  }

  return null
}
