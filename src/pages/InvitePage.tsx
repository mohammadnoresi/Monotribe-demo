import { useMemo, useState } from 'react'
import {
  answerLabel,
  createDraftInvitation,
  getInvitationStatus,
  getPrototypeInvitations,
} from '../data/community/invitationSelectors.ts'
import { invitationQuestions } from '../data/community/invitationData.ts'
import { primaryDemoUserId } from '../data/community/communityData.ts'
import type { ReactNode } from 'react'
import type { GeneratedInvitation, InvitationAnswer, InvitationAnswerValue } from '../types/invitation.ts'

const answerValues: InvitationAnswerValue[] = ['yes', 'partial', 'no']

const statusLabels: Record<GeneratedInvitation['status'], string> = {
  ready: 'آماده ساخت لینک',
  'needs-review': 'نیازمند مکث و بازبینی',
  blocked: 'دعوت در این نمونه متوقف می‌شود',
}

const statusDescriptions: Record<GeneratedInvitation['status'], string> = {
  ready: 'پاسخ‌ها نشان می‌دهد دعوت از جنس اعتماد نزدیک است، نه رشد سریع شبکه.',
  'needs-review': 'چند پاسخ هنوز قطعی نیست. این صفحه عمداً از شما می‌خواهد قبل از دعوت بیشتر فکر کنید.',
  blocked: 'با این پاسخ‌ها مونوترایب لینک دعوت نمی‌سازد، چون اسپانسر بودن باید آگاهانه و جدی بماند.',
}

export function InvitePage() {
  const [invitedName, setInvitedName] = useState('علی رضوانی')
  const [answers, setAnswers] = useState<InvitationAnswer[]>(
    invitationQuestions.map((question) => ({ questionId: question.id, value: 'yes' })),
  )
  const [generatedInvitation, setGeneratedInvitation] = useState<GeneratedInvitation | null>(null)

  const examples = useMemo(() => getPrototypeInvitations(), [])
  const draftInvitation = useMemo(
    () => createDraftInvitation(invitedName, answers),
    [answers, invitedName],
  )
  const isReady = getInvitationStatus(answers) === 'ready' && invitedName.trim().length > 1

  function updateAnswer(questionId: string, value: InvitationAnswerValue) {
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer) => (answer.questionId === questionId ? { ...answer, value } : answer)),
    )
    setGeneratedInvitation(null)
  }

  function generateLink() {
    if (!isReady) return
    setGeneratedInvitation(draftInvitation)
  }

  return (
    <main className="invite-screen">
      <header className="invite-hero">
        <p className="network-kicker">نمونه‌ی اولیه پژوهشی</p>
        <h1>دعوت از یک فرد قابل اعتماد</h1>
        <p>این جریان نشان می‌دهد دعوت کردن در مونوترایب یک مسئولیت اجتماعی است.</p>
      </header>

      <div className="invite-layout">
        <section className="invite-flow" aria-label="ساخت دعوتنامه">
          <InviteStep number="۱" title="انتخاب فرد">
            <label className="invite-name-field">
              <span>نام فردی که می‌خواهید دعوت کنید</span>
              <input
                value={invitedName}
                onChange={(event) => {
                  setInvitedName(event.target.value)
                  setGeneratedInvitation(null)
                }}
                placeholder="مثلاً علی رضوانی"
              />
            </label>
            <div className="sponsor-explain-box">
              <strong>شما در حال معرفی این فرد به MonoTribe هستید.</strong>
              <span>اسپانسر یعنی شما باعث ورود این فرد به قبیله شده‌اید و این رابطه تاریخی باقی می‌ماند.</span>
            </div>
          </InviteStep>

          <InviteStep number="۲" title="پرسش‌های اعتماد">
            <div className="trust-question-list">
              {invitationQuestions.map((question) => {
                const answer = answers.find((item) => item.questionId === question.id)?.value ?? 'partial'

                return (
                  <div
                    className="trust-question"
                    key={question.id}
                    role="group"
                    aria-labelledby={`trust-question-${question.id}`}
                  >
                    <h3 id={`trust-question-${question.id}`}>{question.text}</h3>
                    <div>
                      {answerValues.map((value) => (
                        <button
                          type="button"
                          className={answer === value ? 'is-active' : ''}
                          key={value}
                          onClick={() => updateAnswer(question.id, value)}
                        >
                          {answerLabel(value)}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </InviteStep>

          <InviteStep number="۳" title="پذیرش مسئولیت">
            <div className={`invite-responsibility invite-responsibility-${draftInvitation.status}`}>
              <strong>{statusLabels[draftInvitation.status]}</strong>
              <p>{statusDescriptions[draftInvitation.status]}</p>
              <dl>
                <div>
                  <dt>فرد دعوت‌شونده</dt>
                  <dd>{draftInvitation.invitedName || 'نام وارد نشده'}</dd>
                </div>
                <div>
                  <dt>اسپانسر</dt>
                  <dd>{draftInvitation.sponsorName}</dd>
                </div>
                <div>
                  <dt>شناسه اسپانسر</dt>
                  <dd>{primaryDemoUserId}</dd>
                </div>
              </dl>
            </div>
          </InviteStep>

          <InviteStep number="۴" title="ساخت لینک دعوت">
            <button type="button" className="generate-invite-button" disabled={!isReady} onClick={generateLink}>
              ساخت لینک دعوت مسئولانه
            </button>
            {!isReady ? (
              <p className="invite-blocked-note">برای ساخت لینک، نام باید وارد شود و پاسخ هر سه پرسش «بله» باشد.</p>
            ) : null}
            {generatedInvitation ? <GeneratedInvitationCard invitation={generatedInvitation} /> : null}
          </InviteStep>
        </section>

        <aside className="invite-preview-panel" aria-label="پیش‌نمایش و نمونه‌های دعوت">
          <h2>پیش‌نمایش دعوت</h2>
          <InvitationLandingPreview invitation={generatedInvitation ?? draftInvitation} />

          <h2>نمونه‌های داده ثابت</h2>
          <div className="prototype-invitation-list">
            {examples.map((example) => (
              <article key={example.id}>
                <strong>{example.invitedName}</strong>
                <span>{example.sponsorName} به عنوان اسپانسر</span>
                <em>{statusLabels[example.status]}</em>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}

function InviteStep({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section className="invite-step">
      <header>
        <span>{number}</span>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  )
}

function GeneratedInvitationCard({ invitation }: { invitation: GeneratedInvitation }) {
  const absoluteLink = `${window.location.origin}${invitation.invitationLink}`

  return (
    <div className="generated-invite-card">
      <strong>لینک اختصاصی ساخته شد</strong>
      <code dir="ltr">{absoluteLink}</code>
      <p>
        این لینک به {invitation.invitedName}، اسپانسر {invitation.sponsorName} و شناسه دعوت {invitation.id} گره خورده است.
      </p>
      <span>{invitation.isLinkValidForInvitation ? 'اعتبار نمونه لینک تأیید شد' : 'لینک با این دعوتنامه هم‌خوان نیست'}</span>
    </div>
  )
}

function InvitationLandingPreview({ invitation }: { invitation: GeneratedInvitation }) {
  return (
    <div className="invitation-landing-preview">
      <p className="network-kicker">صفحه فرود دعوتنامه</p>
      <h3>
        {invitation.invitedName || 'این فرد'} توسط {invitation.sponsorName} به مونوترایب دعوت شده است.
      </h3>
      <p>
        مونوترایب یک جامعه کوچک و احراز هویت‌شده است که عضویت در آن از مسیر معرفی مسئولانه اعضای فعلی اتفاق
        می‌افتد.
      </p>
      <div className="landing-sponsor-box">
        <strong>چرا این دعوت وجود دارد؟</strong>
        <span>
          چون {invitation.sponsorName} پذیرفته که این فرد را به قبیله معرفی کند، نه برای امتیاز یا پاداش، بلکه برای
          ساختن یک شبکه قابل اعتماد.
        </span>
      </div>
      <button type="button">پذیرش دعوت در نمونه اولیه</button>
    </div>
  )
}
