import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, { type ForceGraphMethods, type LinkObject, type NodeObject } from 'react-force-graph-3d'
import * as THREE from 'three'
import type { GraphLink, GraphNode } from '../types/community.ts'
import { friendGraph, primaryDemoUserId } from '../data/community/index.ts'
import { findShortestFriendPath, pathLinkKey } from '../utils/friendPath.ts'

type FriendGraphNode = GraphNode & NodeObject
type FriendGraphLink = GraphLink & LinkObject<FriendGraphNode, GraphLink>

const graphBackground = '#101313'
const secondaryLinkColor = 'rgba(151, 164, 154, 0.22)'
const primaryColor = '#e3c16f'
const selectedColor = '#f4a261'
const pathColor = '#77d9c8'

const avatarTextureCache = new Map<string, THREE.CanvasTexture>()
const labelTextureCache = new Map<string, THREE.CanvasTexture>()

export function FriendNetworkGraph() {
  const graphRef = useRef<ForceGraphMethods<FriendGraphNode, FriendGraphLink> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedMemberId, setSelectedMemberId] = useState(primaryDemoUserId)
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null)
  const size = useElementSize(containerRef)

  const graphData = useMemo(
    () => ({
      nodes: friendGraph.nodes.map((node) => ({ ...node })),
      links: friendGraph.links.map((link) => ({ ...link })),
    }),
    [],
  )

  const membersById = useMemo(
    () => new Map(friendGraph.nodes.map((member) => [member.id, member])),
    [],
  )

  const selectedPath = useMemo(
    () => findShortestFriendPath(friendGraph.links, primaryDemoUserId, selectedMemberId),
    [selectedMemberId],
  )

  const highlightedNodeIds = useMemo(() => new Set(selectedPath.path), [selectedPath.path])
  const highlightedLinkKeys = useMemo(() => {
    const keys = new Set<string>()

    selectedPath.path.forEach((memberId, index) => {
      const nextMemberId = selectedPath.path[index + 1]
      if (nextMemberId) keys.add(pathLinkKey(memberId, nextMemberId))
    })

    return keys
  }, [selectedPath.path])

  const selectedMember = membersById.get(selectedMemberId) ?? membersById.get(primaryDemoUserId)!
  const pathNames = selectedPath.path
    .map((memberId) => membersById.get(memberId)?.displayName)
    .filter(Boolean)
    .join(' ← ')

  useEffect(() => {
    graphRef.current?.zoomToFit(900, 64)
  }, [])

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

      return highlightedLinkKeys.has(pathLinkKey(sourceId, targetId)) ? pathColor : secondaryLinkColor
    },
    [highlightedLinkKeys],
  )

  const getLinkWidth = useCallback(
    (link: FriendGraphLink) => {
      const sourceId = memberIdFromLinkEndpoint(link.source)
      const targetId = memberIdFromLinkEndpoint(link.target)

      return highlightedLinkKeys.has(pathLinkKey(sourceId, targetId)) ? 3 : 0.5
    },
    [highlightedLinkKeys],
  )

  return (
    <main className="network-screen">
      <section className="network-stage" aria-label="شبکه دوستان مونوترایب">
        <div className="network-heading">
          <div>
            <p className="network-kicker">نمونه‌ی اولیه پژوهشی</p>
            <h1>شبکه دوستان مونوترایب</h1>
          </div>
          <div className="network-counts">
            <span>{toPersianDigits(friendGraph.nodes.length)} نفر</span>
            <span>{toPersianDigits(friendGraph.links.length)} رابطه دوستی</span>
          </div>
        </div>

        <div className="network-canvas" ref={containerRef}>
          {size.width > 0 && size.height > 0 ? (
            <ForceGraph3D<FriendGraphNode, FriendGraphLink>
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
              linkDirectionalParticles={(link) => {
                const sourceId = memberIdFromLinkEndpoint(link.source)
                const targetId = memberIdFromLinkEndpoint(link.target)

                return highlightedLinkKeys.has(pathLinkKey(sourceId, targetId)) ? 2 : 0
              }}
              linkDirectionalParticleColor={() => pathColor}
              linkDirectionalParticleWidth={2.4}
              onNodeHover={(node) => setHoveredMemberId(node?.id ?? null)}
              onNodeClick={handleNodeClick}
              showNavInfo={false}
              enableNodeDrag={false}
              cooldownTicks={120}
              d3VelocityDecay={0.32}
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
            <dt>فاصله از سارا</dt>
            <dd>{formatDistance(selectedPath.distance)}</dd>
          </div>
        </dl>

        <div className="path-panel">
          <h3>مسیر ارتباط</h3>
          <p>{pathNames || 'مسیر ارتباطی پیدا نشد.'}</p>
        </div>
      </aside>
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
  context.font = `${isEmphasized ? 700 : 500} 38px Tahoma, Arial, sans-serif`
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

function formatDistance(distance: number | null) {
  if (distance === null) return 'مسیر ارتباطی پیدا نشد'
  if (distance === 0) return 'این شما هستید'

  return `${toPersianDigits(distance)} ارتباط با شما فاصله دارد`
}

function toPersianDigits(value: number) {
  return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value)
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
