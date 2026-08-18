import type {
  GeneratedInvitation,
  InvitationAnswer,
  InvitationAnswerValue,
  ParsedInvitationLink,
  PrototypeInvitation,
  PrototypeInvitationStatus,
} from '../../types/invitation.ts'
import { members, primaryDemoUserId } from './communityData.ts'
import { invitationQuestions, prototypeInvitations } from './invitationData.ts'

const memberById = new Map(members.map((member) => [member.id, member]))

export function getPrototypeInvitations() {
  return prototypeInvitations.map((invitation) => generateInvitation(invitation))
}

export function createDraftInvitation(invitedName: string, answers: InvitationAnswer[]): GeneratedInvitation {
  const normalizedName = normalizeInvitationName(invitedName)
  const status = getInvitationStatus(answers)
  const invitation: PrototypeInvitation = {
    id: `inv-${primaryDemoUserId}-${slugifyName(normalizedName)}-${hashInvitationParts(primaryDemoUserId, normalizedName)}`,
    inviterId: primaryDemoUserId,
    invitedName: normalizedName,
    answers,
    status,
    createdAtLabel: 'ساخته‌شده در همین نمونه اولیه',
  }

  return generateInvitation(invitation)
}

export function getInvitationStatus(answers: InvitationAnswer[]): PrototypeInvitationStatus {
  if (answers.some((answer) => answer.value === 'no')) return 'blocked'
  if (answers.some((answer) => answer.value === 'partial')) return 'needs-review'
  if (answers.length !== invitationQuestions.length) return 'needs-review'

  return 'ready'
}

export function generateInvitation(invitation: PrototypeInvitation): GeneratedInvitation {
  const sponsor = memberById.get(invitation.inviterId) ?? memberById.get(primaryDemoUserId)!
  const nameToken = encodeURIComponent(invitation.invitedName)
  const signature = hashInvitationParts(invitation.inviterId, invitation.invitedName, invitation.id)
  const invitationLink = `/#/invite/prototype/${invitation.inviterId}/${invitation.id}/${nameToken}?sig=${signature}`

  return {
    ...invitation,
    sponsorName: sponsor.displayName,
    invitationLink,
    isLinkValidForInvitation: isPrototypeInvitationLinkValid(invitationLink, invitation),
  }
}

export function isPrototypeInvitationLinkValid(link: string, invitation: PrototypeInvitation) {
  const expectedSignature = hashInvitationParts(invitation.inviterId, invitation.invitedName, invitation.id)
  const encodedName = encodeURIComponent(invitation.invitedName)

  return (
    link.includes(`/#/invite/prototype/${invitation.inviterId}/${invitation.id}/${encodedName}`) &&
    link.endsWith(`sig=${expectedSignature}`)
  )
}

export function parsePrototypeInvitationLink(link: string): ParsedInvitationLink | null {
  const url = new URL(link, 'http://prototype.local')
  if (!url.hash.startsWith('#/invite/prototype/')) return null

  const hashUrl = new URL(url.hash.slice(1), 'http://prototype.local')
  const [, section, type, inviterId = '', invitationId = '', encodedName = ''] = hashUrl.pathname.split('/')
  const invitedName = decodeURIComponent(encodedName ?? '')
  const sponsorName = memberById.get(inviterId)?.displayName ?? 'اسپانسر نامشخص'
  const expectedSignature = hashInvitationParts(inviterId, invitedName, invitationId)
  const isValid =
    section === 'invite' &&
    type === 'prototype' &&
    Boolean(inviterId) &&
    Boolean(invitationId) &&
    Boolean(invitedName) &&
    hashUrl.searchParams.get('sig') === expectedSignature

  return {
    inviterId,
    invitationId,
    invitedName,
    sponsorName,
    isValid,
  }
}

export function answerLabel(value: InvitationAnswerValue) {
  const labels: Record<InvitationAnswerValue, string> = {
    yes: 'بله',
    partial: 'تا حدی',
    no: 'خیر',
  }

  return labels[value]
}

function normalizeInvitationName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

function slugifyName(name: string) {
  return encodeURIComponent(name).replace(/%/g, '').toLowerCase().slice(0, 28) || 'unknown'
}

function hashInvitationParts(...parts: string[]) {
  const source = parts.join('|')
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0
  }

  return hash.toString(36)
}
