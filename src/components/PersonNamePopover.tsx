import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { avatarThumbnailUrlFor } from '../data/community/avatarAssets.ts'
import { members, primaryDemoUserId } from '../data/community/communityData.ts'
import { friendGraph } from '../data/community/graphSelectors.ts'
import { findShortestFriendPath } from '../utils/friendPath.ts'

type PersonNamePopoverProps = {
  memberId: string
  children?: ReactNode
  onOpenMember: (memberId: string) => void
}

type PersonPathPopoverListProps = {
  memberIds: string[]
  fallback?: string
  onOpenMember: (memberId: string) => void
}

const memberById = new Map(members.map((member) => [member.id, member]))

export function PersonNamePopover({ memberId, children, onOpenMember }: PersonNamePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const member = memberById.get(memberId)
  const path = useMemo(() => findShortestFriendPath(friendGraph.links, primaryDemoUserId, memberId), [memberId])
  const pathNames = path.path
    .map((pathMemberId) => memberById.get(pathMemberId)?.displayName)
    .filter(Boolean)
    .join(' ← ')

  if (!member) return <>{children ?? 'عضو ناشناس'}</>

  useLayoutEffect(() => {
    if (!isOpen) return

    updatePopoverPosition()

    window.addEventListener('resize', updatePopoverPosition)
    window.addEventListener('scroll', updatePopoverPosition, true)

    return () => {
      window.removeEventListener('resize', updatePopoverPosition)
      window.removeEventListener('scroll', updatePopoverPosition, true)
    }
  }, [isOpen])

  function updatePopoverPosition() {
    const trigger = triggerRef.current
    if (!trigger) return

    const triggerRect = trigger.getBoundingClientRect()
    const popoverWidth = Math.min(310, window.innerWidth - 36)
    const popoverHeight = 210
    const horizontalMargin = 18
    const verticalGap = 8
    const preferredLeft = triggerRect.right - popoverWidth
    const left = Math.min(
      Math.max(horizontalMargin, preferredLeft),
      Math.max(horizontalMargin, window.innerWidth - popoverWidth - horizontalMargin),
    )
    const shouldOpenAbove = triggerRect.bottom + verticalGap + popoverHeight > window.innerHeight
    const top = shouldOpenAbove
      ? Math.max(verticalGap, triggerRect.top - popoverHeight - verticalGap)
      : triggerRect.bottom + verticalGap

    setPopoverStyle({
      left,
      top,
      width: popoverWidth,
    })
  }

  function keepOpen() {
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current)
    updatePopoverPosition()
    setIsOpen(true)
  }

  function closeSoon() {
    closeTimeoutRef.current = window.setTimeout(() => setIsOpen(false), 160)
  }

  function openMember() {
    setIsOpen(false)
    onOpenMember(memberId)
  }

  const popover = isOpen
    ? createPortal(
        <span
          className="person-popover"
          style={popoverStyle}
          role="dialog"
          aria-label={`خلاصه پروفایل ${member.displayName}`}
          onMouseEnter={keepOpen}
          onMouseLeave={closeSoon}
        >
          <span className="person-popover-top">
            <img src={avatarThumbnailUrlFor(member.avatarThumbnailFileName)} alt="" />
            <span>
              <strong>{member.displayName}</strong>
              <small>
                {member.city}، {member.profession}
              </small>
            </span>
          </span>
          <span className="person-popover-path">
            {formatDistance(path.distance)}
            {pathNames ? <small>{pathNames}</small> : null}
          </span>
          <button type="button" onClick={openMember}>
            مشاهده پروفایل در شبکه
          </button>
        </span>,
        document.body,
      )
    : null

  return (
    <span className="person-popover-wrap" onMouseEnter={keepOpen} onMouseLeave={closeSoon} onFocus={keepOpen}>
      <button
        ref={triggerRef}
        type="button"
        className="person-name-trigger"
        onClick={() => {
          updatePopoverPosition()
          setIsOpen(true)
        }}
        aria-expanded={isOpen}
      >
        {children ?? member.displayName}
      </button>
      {popover}
    </span>
  )
}

export function PersonPathPopoverList({ memberIds, fallback, onOpenMember }: PersonPathPopoverListProps) {
  if (memberIds.length === 0) return <>{fallback ?? 'مسیر ارتباطی پیدا نشد.'}</>

  return (
    <span className="person-path-popover-list">
      {memberIds.map((memberId, index) => {
        const member = memberById.get(memberId)

        return (
          <span key={`${memberId}-${index}`} className="person-path-step">
            {index > 0 ? <span className="person-path-separator">←</span> : null}
            <PersonNamePopover memberId={memberId} onOpenMember={onOpenMember}>
              {member?.displayName ?? 'عضو ناشناس'}
            </PersonNamePopover>
          </span>
        )
      })}
    </span>
  )
}

function formatDistance(distance: number | null) {
  if (distance === null) return 'مسیر ارتباطی مشخصی با کاربر فعلی پیدا نشد'
  if (distance === 0) return 'پروفایل کاربر فعلی'

  return `${new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(distance)} ارتباط با کاربر فعلی فاصله دارد`
}
