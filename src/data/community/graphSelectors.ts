import type { GraphData, GraphLink, GraphNode, RelationshipType } from '../../types/community.ts'
import { avatarThumbnailUrlFor } from './avatarAssets.ts'
import { members, primaryDemoUserId, relationships } from './communityData.ts'

export function getGraphNodes(): GraphNode[] {
  return members.map((member) => ({
    id: member.id,
    displayName: member.displayName,
    avatar: avatarThumbnailUrlFor(member.avatarThumbnailFileName),
    avatarThumbnail: avatarThumbnailUrlFor(member.avatarThumbnailFileName),
    city: member.city,
    verified: member.verified,
    profession: member.profession,
    clusterId: member.clusterId,
    isPrimaryDemoUser: member.id === primaryDemoUserId,
  }))
}

export function getGraphLinks(type?: RelationshipType): GraphLink[] {
  return relationships
    .filter((relationship) => !type || relationship.type === type)
    .map((relationship) => ({
      id: relationship.id,
      source: relationship.fromMemberId,
      target: relationship.toMemberId,
      type: relationship.type,
    }))
}

export function getGraphData(type?: RelationshipType): GraphData {
  return {
    nodes: getGraphNodes(),
    links: getGraphLinks(type),
  }
}

export const friendGraph = getGraphData('friend')
export const trustedGraph = getGraphData('trusted')
export const sponsorGraph = getGraphData('sponsor')
export const fullRelationshipGraph = getGraphData()
