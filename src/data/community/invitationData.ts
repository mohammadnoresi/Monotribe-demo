import type { InvitationQuestion, PrototypeInvitation } from '../../types/invitation.ts'

export const invitationQuestionSource =
  'شبکه‌ی اجتماعی مونوترایب.docx، بخش «فرآیند ساخت دعوتنامه»'

export const invitationQuestions: InvitationQuestion[] = [
  {
    id: 'hard-moment-call',
    text: 'اگر همین الان در یک موقعیت سخت باشی که به کمک نیاز داری، آیا می‌توانی بدون احساس شرم به این شخص زنگ بزنی و از او کمک بخواهی؟',
  },
  {
    id: 'home-key',
    text: 'اگر در سفر باشی، آیا کلید خانه‌ات را به این فرد می‌دهی تا به خانه سر بزند؟',
  },
  {
    id: 'family-or-manager',
    text: 'آیا حاضر هستی او را به خانواده یا مدیرت در محیط کار معرفی کنی؟',
  },
]

export const prototypeInvitations: PrototypeInvitation[] = [
  {
    id: 'inv-mt001-ali-rezvani',
    inviterId: 'mt001',
    invitedName: 'علی رضوانی',
    answers: invitationQuestions.map((question) => ({ questionId: question.id, value: 'yes' })),
    status: 'ready',
    createdAtLabel: 'نمونه آماده برای مصاحبه',
  },
  {
    id: 'inv-mt008-sahar-ahmadi',
    inviterId: 'mt008',
    invitedName: 'سحر احمدی',
    answers: invitationQuestions.map((question) => ({ questionId: question.id, value: 'yes' })),
    status: 'ready',
    createdAtLabel: 'نمونه دعوت عضو دیگر',
  },
  {
    id: 'inv-mt001-nima-rad',
    inviterId: 'mt001',
    invitedName: 'نیما راد',
    answers: [
      { questionId: 'hard-moment-call', value: 'partial' },
      { questionId: 'home-key', value: 'no' },
      { questionId: 'family-or-manager', value: 'partial' },
    ],
    status: 'blocked',
    createdAtLabel: 'نمونه دعوت کم‌اعتماد',
  },
]
