import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, { type ForceGraphMethods, type LinkObject, type NodeObject } from 'react-force-graph-3d'
import * as THREE from 'three'
import type { GraphData, GraphLink, GraphNode } from '../types/community.ts'
import { friendGraph, members, primaryDemoUserId, relationships, sponsorGraph, trustedGraph } from '../data/community/index.ts'
import { getTrustProfileContext } from '../data/community/profileData.ts'
import { findShortestFriendPath, pathLinkKey } from '../utils/friendPath.ts'
import { MemberTrustProfile } from './MemberTrustProfile.tsx'

type FriendGraphNode = GraphNode & NodeObject
type FriendGraphLink = GraphLink & LinkObject<FriendGraphNode, GraphLink>
type GraphMode = 'friend' | 'sponsor' | 'trusted'

const graphBackground = '#101313'
const secondaryLinkColor = 'rgba(151, 164, 154, 0.22)'
const primaryColor = '#e3c16f'
const selectedColor = '#f4a261'
const pathColor = '#77d9c8'
const sponsorColor = '#d7b861'
const trustColor = '#a3d8ff'

// Temporary prototype root. In production this would be the founding member/community creator.
const DEMO_SPONSOR_ROOT = 'mt012'

const graphModes: Record<
  GraphMode,
  {
    label: string
    title: string
    description: string
    relationshipLabel: string
    data: GraphData
    directed: boolean
    dagMode?: 'td'
  }
> = {
  friend: {
    label: 'دوستی',
    title: 'شبکه دوستی مونوترایب',
    description: 'شبکه ارتباطات واقعی افراد: چه کسی چه کسی را در دنیای واقعی می‌شناسد.',
    relationshipLabel: 'رابطه دوستی',
    data: friendGraph,
    directed: false,
  },
  sponsor: {
    label: 'معرفی اعضا',
    title: 'شبکه معرفی اعضا',
    description: 'تاریخ ورود افراد به قبیله: چه کسی باعث ورود چه کسی به مونوترایب شده است.',
    relationshipLabel: 'رابطه معرفی',
    data: sponsorGraph,
    directed: true,
    dagMode: 'td',
  },
  trusted: {
    label: 'اعتماد',
    title: 'شبکه اعتماد',
    description: 'روابط اعتماد بین اعضا: جهت پیکان نشان می‌دهد چه کسی به چه کسی اعتماد دارد.',
    relationshipLabel: 'رابطه اعتماد',
    data: trustedGraph,
    directed: true,
  },
}

const memberById = new Map(members.map((member) => [member.id, member]))

const avatarTextureCache = new Map<string, THREE.CanvasTexture>()
const labelTextureCache = new Map<string, THREE.CanvasTexture>()

type FriendNetworkGraphProps = {
  focusedMemberId: string | null
  onFocusHandled: () => void
}

export function FriendNetworkGraph({ focusedMemberId, onFocusHandled }: FriendNetworkGraphProps) {
  const graphRef = useRef<ForceGraphMethods<FriendGraphNode, FriendGraphLink> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [graphMode, setGraphMode] = useState<GraphMode>('friend')
  const [selectedMemberId, setSelectedMemberId] = useState(primaryDemoUserId)
  const [profileMemberId, setProfileMemberId] = useState<string | null>(null)
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null)
  const size = useElementSize(containerRef)
  const modeConfig = graphModes[graphMode]

  const graphData = useMemo(
    () => ({
      nodes: modeConfig.data.nodes.map((node) => ({ ...node })),
      links: modeConfig.data.links.map((link) => ({ ...link })),
    }),
    [modeConfig.data],
  )

  const membersById = useMemo(
    () => new Map(graphData.nodes.map((member) => [member.id, member])),
    [graphData.nodes],
  )

  const selectedPath = useMemo(() => {
    if (graphMode === 'friend') return findShortestFriendPath(friendGraph.links, primaryDemoUserId, selectedMemberId)
    if (graphMode === 'sponsor') return findDirectedPath(sponsorGraph.links, DEMO_SPONSOR_ROOT, selectedMemberId)

    return findDirectedPath(trustedGraph.links, primaryDemoUserId, selectedMemberId)
  }, [graphMode, selectedMemberId])

  const highlightedNodeIds = useMemo(() => new Set(selectedPath.path), [selectedPath.path])
  const highlightedLinkKeys = useMemo(() => {
    const keys = new Set<string>()

    selectedPath.path.forEach((memberId, index) => {
      const nextMemberId = selectedPath.path[index + 1]
      if (!nextMemberId) return

      keys.add(graphMode === 'friend' ? pathLinkKey(memberId, nextMemberId) : directedPathLinkKey(memberId, nextMemberId))
    })

    if (graphMode !== 'friend') {
      graphData.links.forEach((link) => {
        if (link.source === selectedMemberId || link.target === selectedMemberId) {
          keys.add(directedPathLinkKey(link.source, link.target))
        }
      })
    }

    return keys
  }, [graphData.links, graphMode, selectedMemberId, selectedPath.path])

  const selectedMember = membersById.get(selectedMemberId) ?? membersById.get(primaryDemoUserId)!
  const profileMember = profileMemberId ? membersById.get(profileMemberId) : null
  const profilePath = useMemo(
    () => findShortestFriendPath(friendGraph.links, primaryDemoUserId, profileMemberId ?? selectedMemberId),
    [profileMemberId, selectedMemberId],
  )
  const profilePathNames = profilePath.path
    .map((memberId) => membersById.get(memberId)?.displayName)
    .filter(Boolean)
    .join(' ← ')
  const profileContext = profileMemberId ? getTrustProfileContext(profileMemberId) : null
  const pathNames = selectedPath.path
    .map((memberId) => membersById.get(memberId)?.displayName)
    .filter(Boolean)
    .join(' ← ')
  const selectedRelationshipContext = getSelectedRelationshipContext(graphMode, selectedMemberId, selectedPath.distance)
  const reciprocalTrustLinkKeys = useMemo(() => getReciprocalTrustLinkKeys(trustedGraph.links), [])
  const reciprocalTrustPairCount = reciprocalTrustLinkKeys.size / 2
  const oneWayTrustCount = trustedGraph.links.length - reciprocalTrustLinkKeys.size

  useEffect(() => {
    graphRef.current?.zoomToFit(900, 64)
  }, [graphMode, graphData.links.length])

  useEffect(() => {
    if (!focusedMemberId) return

    setGraphMode('friend')
    setSelectedMemberId(focusedMemberId)
    setProfileMemberId(focusedMemberId)
    onFocusHandled()
  }, [focusedMemberId, onFocusHandled])

  function selectGraphMode(nextGraphMode: GraphMode) {
    setGraphMode(nextGraphMode)
    setSelectedMemberId(nextGraphMode === 'sponsor' ? DEMO_SPONSOR_ROOT : primaryDemoUserId)
    setProfileMemberId(null)
  }

  const handleNodeClick = useCallback((node: FriendGraphNode) => {
    setSelectedMemberId(node.id)
    graphRef.current?.cameraPosition(
      {
        x: (node.x ?? 0) + 70,
        y: (node.y ?? 0) + 34,
        z: (node.z ?? 0) + 110,
      },
      {
        x: node.x ?? 0,
        y: node.y ?? 0,
        z: node.z ?? 0,
      },
      900,
    )
  }, [])

  const renderNode = useCallback(
    (node: FriendGraphNode) =>
      createNodeObject(node, {
        isSelected: node.id === selectedMemberId,
        isHovered: node.id === hoveredMemberId,
        isInPath: highlightedNodeIds.has(node.id),
      }),
    [highlightedNodeIds, hoveredMemberId, selectedMemberId],
  )

  const getLinkColor = useCallback(
    (link: FriendGraphLink) => {
      const sourceId = memberIdFromLinkEndpoint(link.source)
      const targetId = memberIdFromLinkEndpoint(link.target)
      const linkKey = linkKeyForMode(graphMode, sourceId, targetId)

      if (highlightedLinkKeys.has(linkKey)) return graphMode === 'sponsor' ? sponsorColor : graphMode === 'trusted' ? trustColor : pathColor
      if (graphMode === 'sponsor') return 'rgba(215, 184, 97, 0.28)'
      if (graphMode === 'trusted') {
        return reciprocalTrustLinkKeys.has(directedPathLinkKey(sourceId, targetId))
          ? 'rgba(119, 217, 200, 0.42)'
          : 'rgba(163, 216, 255, 0.24)'
      }

      return secondaryLinkColor
    },
    [graphMode, highlightedLinkKeys, reciprocalTrustLinkKeys],
  )

  const getLinkWidth = useCallback(
    (link: FriendGraphLink) => {
      const sourceId = memberIdFromLinkEndpoint(link.source)
      const targetId = memberIdFromLinkEndpoint(link.target)
      const linkKey = linkKeyForMode(graphMode, sourceId, targetId)

      if (highlightedLinkKeys.has(linkKey)) return graphMode === 'friend' ? 3 : 2.2

      if (graphMode === 'trusted' && reciprocalTrustLinkKeys.has(directedPathLinkKey(sourceId, targetId))) return 1.25

      return graphMode === 'friend' ? 0.5 : 0.85
    },
    [graphMode, highlightedLinkKeys, reciprocalTrustLinkKeys],
  )

  return (
    <main className="network-screen">
      <section className="network-stage" aria-label="شبکه دوستان مونوترایب">
        <div className="network-heading">
          <div>
            <p className="network-kicker">نمونه‌ی اولیه پژوهشی</p>
            <h1>{modeConfig.title}</h1>
            <p className="network-description">{modeConfig.description}</p>
          </div>
          <div className="network-counts">
            <span>{toPersianDigits(graphData.nodes.length)} نفر</span>
            <span>
              {toPersianDigits(graphData.links.length)} {modeConfig.relationshipLabel}
            </span>
          </div>
        </div>

        {graphMode === 'trusted' ? (
          <div className="graph-trust-legend" aria-label="راهنمای رابطه اعتماد">
            <span>
              <i className="legend-line legend-line-reciprocal" />
              اعتماد دوطرفه: {toPersianDigits(reciprocalTrustPairCount)} رابطه
            </span>
            <span>
              <i className="legend-line legend-line-one-way" />
              اعتماد یک‌طرفه: {toPersianDigits(oneWayTrustCount)} رابطه
            </span>
          </div>
        ) : null}

        <div className="graph-mode-selector" aria-label="انتخاب نوع شبکه">
          <span>نوع شبکه:</span>
          <div>
            {(Object.keys(graphModes) as GraphMode[]).map((mode) => (
              <button
                type="button"
                className={graphMode === mode ? 'is-active' : ''}
                key={mode}
                onClick={() => selectGraphMode(mode)}
              >
                {graphModes[mode].label}
              </button>
            ))}
          </div>
        </div>

        <div className="network-canvas" ref={containerRef}>
          {size.width > 0 && size.height > 0 ? (
            <ForceGraph3D<FriendGraphNode, FriendGraphLink>
              key={graphMode}
              ref={graphRef}
              graphData={graphData}
              width={size.width}
              height={size.height}
              backgroundColor={graphBackground}
              nodeThreeObject={renderNode}
              nodeLabel={(node) => node.displayName}
              linkColor={getLinkColor}
              linkWidth={getLinkWidth}
              linkOpacity={0.72}
              linkCurvature={graphMode === 'friend' ? 0 : 0.12}
              linkDirectionalArrowLength={(link) => {
                if (!modeConfig.directed) return 0
                if (graphMode !== 'trusted') return 4

                const sourceId = memberIdFromLinkEndpoint(link.source)
                const targetId = memberIdFromLinkEndpoint(link.target)

                return reciprocalTrustLinkKeys.has(directedPathLinkKey(sourceId, targetId)) ? 3 : 4.5
              }}
              linkDirectionalArrowRelPos={1}
              linkDirectionalArrowColor={getLinkColor}
              linkDirectionalParticles={(link) => {
                const sourceId = memberIdFromLinkEndpoint(link.source)
                const targetId = memberIdFromLinkEndpoint(link.target)

                if (highlightedLinkKeys.has(linkKeyForMode(graphMode, sourceId, targetId))) return graphMode === 'friend' ? 2 : 3

                if (graphMode === 'trusted') {
                  return reciprocalTrustLinkKeys.has(directedPathLinkKey(sourceId, targetId)) ? 2 : 1
                }

                return 0
              }}
              linkDirectionalParticleColor={getLinkColor}
              linkDirectionalParticleSpeed={graphMode === 'trusted' ? 0.008 : 0.006}
              linkDirectionalParticleWidth={(link) => {
                const sourceId = memberIdFromLinkEndpoint(link.source)
                const targetId = memberIdFromLinkEndpoint(link.target)

                return highlightedLinkKeys.has(linkKeyForMode(graphMode, sourceId, targetId)) ? 2.6 : 1.2
              }}
              onNodeHover={(node) => setHoveredMemberId(node?.id ?? null)}
              onNodeClick={handleNodeClick}
              showNavInfo={false}
              enableNodeDrag={false}
              dagMode={modeConfig.dagMode}
              dagLevelDistance={graphMode === 'sponsor' ? 34 : null}
              cooldownTicks={120}
              d3VelocityDecay={graphMode === 'sponsor' ? 0.45 : 0.32}
            />
          ) : null}
        </div>
      </section>

      <aside className="network-panel" aria-live="polite">
        <div className="member-card">
          <img src={selectedMember.avatarThumbnail} alt="" className="member-card-avatar" />
          <div>
            <p className="member-card-eyebrow">
              {selectedMember.id === primaryDemoUserId ? 'کاربر دمو' : 'عضو مونوترایب'}
            </p>
            <h2>{selectedMember.displayName}</h2>
          </div>
        </div>

        <dl className="member-facts">
          <div>
            <dt>شهر</dt>
            <dd>{selectedMember.city}</dd>
          </div>
          <div>
            <dt>حرفه</dt>
            <dd>{selectedMember.profession}</dd>
          </div>
          <div>
            <dt>هویت</dt>
            <dd>{selectedMember.verified ? 'تأیید شده' : 'در انتظار تأیید'}</dd>
          </div>
          <div>
            <dt>فاصله از کاربر فعلی</dt>
            <dd>{formatDistance(graphMode, selectedPath.distance)}</dd>
          </div>
        </dl>

        <div className="path-panel">
          <h3>{relationshipContextTitle(graphMode)}</h3>
          <p>{selectedRelationshipContext}</p>
          {pathNames ? <p className="path-chain">{pathNames}</p> : null}
        </div>

        <button type="button" className="profile-open-button" onClick={() => setProfileMemberId(selectedMember.id)}>
          مشاهده پروفایل {selectedMember.displayName}
        </button>
      </aside>

      {profileContext && profileMember ? (
        <MemberTrustProfile
          profile={profileContext}
          avatarUrl={profileMember.avatarThumbnail}
          path={profilePath}
          pathNames={profilePathNames}
          graphContextTitle={relationshipContextTitle(graphMode)}
          graphContextDescription={getSelectedRelationshipContext(graphMode, profileMember.id, selectedPath.distance)}
          onOpenMember={(memberId) => {
            setSelectedMemberId(memberId)
            setProfileMemberId(memberId)
          }}
          onClose={() => setProfileMemberId(null)}
        />
      ) : null}
    </main>
  )
}

function createNodeObject(
  node: FriendGraphNode,
  state: {
    isSelected: boolean
    isHovered: boolean
    isInPath: boolean
  },
) {
  const group = new THREE.Group()
  const emphasis = state.isSelected || state.isHovered || node.isPrimaryDemoUser
  const isSecondary = !state.isInPath && !state.isSelected && !node.isPrimaryDemoUser
  const avatarSize = state.isSelected ? 17 : node.isPrimaryDemoUser ? 16 : state.isInPath ? 15 : 12
  const ringColor = state.isSelected ? selectedColor : node.isPrimaryDemoUser ? primaryColor : state.isInPath ? pathColor : '#f6f0df'
  const opacity = isSecondary ? 0.82 : 1

  const avatar = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getAvatarTexture(node.avatarThumbnail, ringColor, emphasis || state.isInPath),
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  )

  avatar.scale.set(avatarSize, avatarSize, 1)
  group.add(avatar)

  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getLabelTexture(node.displayName, emphasis || state.isInPath),
      transparent: true,
      opacity: emphasis || state.isInPath ? 0.96 : 0.62,
      depthWrite: false,
    }),
  )

  const labelWidth = emphasis || state.isInPath ? 30 : 23
  label.position.set(0, -(avatarSize / 2 + 3.7), 0)
  label.scale.set(labelWidth, labelWidth * 0.22, 1)
  group.add(label)

  return group
}

function getAvatarTexture(imageUrl: string, ringColor: string, isEmphasized: boolean) {
  const cacheKey = `${imageUrl}-${ringColor}-${isEmphasized ? 'strong' : 'soft'}`
  const cachedTexture = avatarTextureCache.get(cacheKey)
  if (cachedTexture) return cachedTexture

  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')!
  drawAvatarPlaceholder(context, ringColor, isEmphasized)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  avatarTextureCache.set(cacheKey, texture)

  const image = new Image()
  image.onload = () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.save()
    context.beginPath()
    context.arc(128, 128, 104, 0, Math.PI * 2)
    context.clip()
    context.drawImage(image, 24, 24, 208, 208)
    context.restore()

    context.beginPath()
    context.arc(128, 128, isEmphasized ? 116 : 112, 0, Math.PI * 2)
    context.strokeStyle = ringColor
    context.lineWidth = isEmphasized ? 16 : 10
    context.stroke()

    context.beginPath()
    context.arc(128, 128, 124, 0, Math.PI * 2)
    context.strokeStyle = 'rgba(255, 255, 255, 0.36)'
    context.lineWidth = 3
    context.stroke()

    texture.needsUpdate = true
  }
  image.src = imageUrl

  return texture
}

function getLabelTexture(text: string, isEmphasized: boolean) {
  const cacheKey = `${text}-${isEmphasized ? 'strong' : 'soft'}`
  const cachedTexture = labelTextureCache.get(cacheKey)
  if (cachedTexture) return cachedTexture

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const context = canvas.getContext('2d')!
  context.direction = 'rtl'
  context.fillStyle = isEmphasized ? 'rgba(246, 240, 223, 0.95)' : 'rgba(246, 240, 223, 0.78)'
  context.strokeStyle = 'rgba(16, 19, 19, 0.82)'
  context.lineWidth = 7
  context.font = `${isEmphasized ? 700 : 500} 38px Vazirmatn, Tahoma, Arial, sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.strokeText(text, 256, 64)
  context.fillText(text, 256, 64)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  labelTextureCache.set(cacheKey, texture)

  return texture
}

function drawAvatarPlaceholder(context: CanvasRenderingContext2D, ringColor: string, isEmphasized: boolean) {
  context.fillStyle = '#27302d'
  context.beginPath()
  context.arc(128, 128, 104, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = ringColor
  context.lineWidth = isEmphasized ? 16 : 10
  context.stroke()
}

function memberIdFromLinkEndpoint(endpoint: string | number | NodeObject<FriendGraphNode> | undefined) {
  if (typeof endpoint === 'object' && endpoint?.id) return String(endpoint.id)

  return String(endpoint)
}

function formatDistance(graphMode: GraphMode, distance: number | null) {
  if (graphMode === 'sponsor') {
    if (distance === null) return 'در شاخه ریشه نمایشی نیست'
    if (distance === 0) return 'ریشه نمایشی این گراف'

    return `${toPersianDigits(distance)} نسل معرفی از ریشه نمایشی فاصله دارد`
  }

  if (graphMode === 'trusted') {
    if (distance === null) return 'مسیر اعتماد مستقیم از کاربر فعلی پیدا نشد'
    if (distance === 0) return 'کاربر فعلی'

    return `${toPersianDigits(distance)} رابطه اعتماد از کاربر فعلی فاصله دارد`
  }

  if (distance === null) return 'مسیر دوستی پیدا نشد'
  if (distance === 0) return 'این شما هستید'

  return `${toPersianDigits(distance)} ارتباط دوستی با کاربر فعلی فاصله دارد`
}

function toPersianDigits(value: number) {
  return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value)
}

function linkKeyForMode(graphMode: GraphMode, source: string, target: string) {
  return graphMode === 'friend' ? pathLinkKey(source, target) : directedPathLinkKey(source, target)
}

function directedPathLinkKey(source: string, target: string) {
  return `${source}->${target}`
}

function getReciprocalTrustLinkKeys(links: GraphLink[]) {
  const allLinkKeys = new Set(links.map((link) => directedPathLinkKey(link.source, link.target)))
  const reciprocalLinkKeys = new Set<string>()

  links.forEach((link) => {
    if (allLinkKeys.has(directedPathLinkKey(link.target, link.source))) {
      reciprocalLinkKeys.add(directedPathLinkKey(link.source, link.target))
    }
  })

  return reciprocalLinkKeys
}

function findDirectedPath(links: GraphLink[], fromMemberId: string, toMemberId: string) {
  if (fromMemberId === toMemberId) {
    return {
      distance: 0,
      path: [fromMemberId],
    }
  }

  const adjacency = new Map<string, string[]>()
  links.forEach((link) => {
    if (!adjacency.has(link.source)) adjacency.set(link.source, [])
    adjacency.get(link.source)!.push(link.target)
  })
  adjacency.forEach((memberIds) => memberIds.sort())

  const queue = [fromMemberId]
  const visited = new Set<string>([fromMemberId])
  const previous = new Map<string, string>()

  while (queue.length > 0) {
    const currentMemberId = queue.shift()!

    for (const nextMemberId of adjacency.get(currentMemberId) ?? []) {
      if (visited.has(nextMemberId)) continue

      visited.add(nextMemberId)
      previous.set(nextMemberId, currentMemberId)

      if (nextMemberId === toMemberId) {
        const path = reconstructDirectedPath(previous, fromMemberId, toMemberId)

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

function reconstructDirectedPath(previous: Map<string, string>, fromMemberId: string, toMemberId: string) {
  const path = [toMemberId]
  let currentMemberId = toMemberId

  while (currentMemberId !== fromMemberId) {
    currentMemberId = previous.get(currentMemberId)!
    path.push(currentMemberId)
  }

  return path.reverse()
}

function relationshipContextTitle(graphMode: GraphMode) {
  if (graphMode === 'sponsor') return 'زمینه معرفی'
  if (graphMode === 'trusted') return 'زمینه اعتماد'

  return 'مسیر ارتباط دوستی'
}

function getSelectedRelationshipContext(graphMode: GraphMode, selectedMemberId: string, distance: number | null) {
  const selectedMember = memberById.get(selectedMemberId)
  if (!selectedMember) return 'عضو انتخاب‌شده در داده نمونه پیدا نشد.'

  if (graphMode === 'sponsor') {
    const sponsor = selectedMember.sponsorId ? memberById.get(selectedMember.sponsorId) : null

    if (selectedMemberId === DEMO_SPONSOR_ROOT) {
      return `${selectedMember.displayName} ریشه نمایشی موقت برای خواندن شبکه معرفی است. این جایگاه به معنی بنیان‌گذار بودن نیست.`
    }

    if (!sponsor) return `${selectedMember.displayName} در داده نمونه معرف ثبت‌شده ندارد.`

    const rootContext =
      distance === null
        ? 'این عضو در شاخه ریشه نمایشی فعلی نیست، اما رابطه معرفی تاریخی او همچنان مشخص است.'
        : `${toPersianDigits(distance)} نسل معرفی با ریشه نمایشی فاصله دارد.`

    return `${selectedMember.displayName} توسط ${sponsor.displayName} وارد مونوترایب شده است. ${rootContext}`
  }

  if (graphMode === 'trusted') {
    const incomingTrust = relationships.filter(
      (relationship) => relationship.type === 'trusted' && relationship.toMemberId === selectedMemberId,
    )
    const outgoingTrust = relationships.filter(
      (relationship) => relationship.type === 'trusted' && relationship.fromMemberId === selectedMemberId,
    )
    const incomingMemberIds = new Set(incomingTrust.map((relationship) => relationship.fromMemberId))
    const outgoingMemberIds = new Set(outgoingTrust.map((relationship) => relationship.toMemberId))
    const reciprocalTrustMember = [...incomingMemberIds]
      .filter((memberId) => outgoingMemberIds.has(memberId))
      .map((memberId) => memberById.get(memberId))
      .find(Boolean)
    const firstIncoming = incomingTrust[0] ? memberById.get(incomingTrust[0].fromMemberId) : null
    const firstOutgoing = outgoingTrust[0] ? memberById.get(outgoingTrust[0].toMemberId) : null

    if (reciprocalTrustMember) {
      return `${selectedMember.displayName} با ${reciprocalTrustMember.displayName} اعتماد دوطرفه دارد. اعتماد دوطرفه یعنی هر دو نفر دیگری را در حلقه اعتماد خود قرار داده‌اند.`
    }

    if (firstIncoming) {
      return `${selectedMember.displayName} در حلقه اعتماد ${firstIncoming.displayName} قرار دارد. این یک رابطه اعتماد یک‌طرفه است و پیکان جهت اعتماد را نشان می‌دهد.`
    }

    if (firstOutgoing) {
      return `${selectedMember.displayName} به ${firstOutgoing.displayName} اعتماد ثبت‌شده دارد. این رابطه هنوز در داده نمونه دوطرفه نیست.`
    }

    return `${selectedMember.displayName} در داده نمونه رابطه اعتماد مستقیم ثبت‌شده ندارد.`
  }

  if (distance === null) return `${selectedMember.displayName} مسیر دوستی مشخصی با کاربر فعلی ندارد.`
  if (distance === 0) return `${selectedMember.displayName} کاربر فعلی این نمونه است.`

  return `${selectedMember.displayName} با ${toPersianDigits(distance)} ارتباط دوستی به کاربر فعلی می‌رسد.`
}

function useElementSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!ref.current) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({
        width: Math.floor(width),
        height: Math.floor(height),
      })
    })

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [ref])

  return size
}
