export type InvitationAnswerValue = 'yes' | 'partial' | 'no'

export type InvitationQuestion = {
  id: string
  text: string
}

export type InvitationAnswer = {
  questionId: string
  value: InvitationAnswerValue
}

export type PrototypeInvitationStatus = 'ready' | 'needs-review' | 'blocked'

export type PrototypeInvitation = {
  id: string
  inviterId: string
  invitedName: string
  answers: InvitationAnswer[]
  status: PrototypeInvitationStatus
  createdAtLabel: string
}

export type GeneratedInvitation = PrototypeInvitation & {
  sponsorName: string
  invitationLink: string
  isLinkValidForInvitation: boolean
}

export type ParsedInvitationLink = {
  inviterId: string
  invitationId: string
  invitedName: string
  sponsorName: string
  isValid: boolean
}
