import type { GraphLink } from '../types/community.ts'

export type FriendPathResult = {
  distance: number | null
  path: string[]
}

export function findShortestFriendPath(links: GraphLink[], fromMemberId: string, toMemberId: string): FriendPathResult {
  if (fromMemberId === toMemberId) {
    return {
      distance: 0,
      path: [fromMemberId],
    }
  }

  const adjacency = buildFriendAdjacency(links)
  const queue: string[] = [fromMemberId]
  const visited = new Set<string>([fromMemberId])
  const previous = new Map<string, string>()

  while (queue.length > 0) {
    const currentMemberId = queue.shift()!

    for (const nextMemberId of adjacency.get(currentMemberId) ?? []) {
      if (visited.has(nextMemberId)) continue

      visited.add(nextMemberId)
      previous.set(nextMemberId, currentMemberId)

      if (nextMemberId === toMemberId) {
        const path = reconstructPath(previous, fromMemberId, toMemberId)

        return {
          distance: path.length - 1,
          path,
        }
      }

      queue.push(nextMemberId)
    }
  }

  return {
    distance: null,
    path: [],
  }
}

export function pathLinkKey(source: string, target: string) {
  return [source, target].sort().join('::')
}

function buildFriendAdjacency(links: GraphLink[]) {
  const adjacency = new Map<string, string[]>()

  links.forEach((link) => {
    if (link.type !== 'friend') return

    if (!adjacency.has(link.source)) adjacency.set(link.source, [])
    if (!adjacency.has(link.target)) adjacency.set(link.target, [])

    adjacency.get(link.source)!.push(link.target)
    adjacency.get(link.target)!.push(link.source)
  })

  adjacency.forEach((memberIds) => memberIds.sort())

  return adjacency
}

function reconstructPath(previous: Map<string, string>, fromMemberId: string, toMemberId: string) {
  const path = [toMemberId]
  let currentMemberId = toMemberId

  while (currentMemberId !== fromMemberId) {
    currentMemberId = previous.get(currentMemberId)!
    path.push(currentMemberId)
  }

  return path.reverse()
}
