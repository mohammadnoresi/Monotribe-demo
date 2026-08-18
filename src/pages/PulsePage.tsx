import { useMemo } from 'react'
import { PersonNamePopover, PersonPathPopoverList } from '../components/PersonNamePopover.tsx'
import { getPulseActivitiesWithContext } from '../data/community/pulseSelectors.ts'
import type { PulseActivityWithContext, PulseSection } from '../types/pulse.ts'

const sectionLabels: Record<PulseSection, string> = {
  network: 'تغییرات شبکه شما',
  nearby: 'اتفاقات نزدیک به شما',
  growth: 'رشد قبیله',
}

const sectionDescriptions: Record<PulseSection, string> = {
  network: 'آدم‌ها و رابطه‌هایی که ساختار شبکه اطراف شما را تغییر داده‌اند.',
  nearby: 'درخواست‌ها، رویدادها و پیشنهادهایی که از مسیر ارتباطی به شما نزدیک‌اند.',
  growth: 'نشانه‌های کلی که نشان می‌دهند این جامعه زنده و در حال شکل‌گیری است.',
}

type PulsePageProps = {
  onOpenMember: (memberId: string) => void
}

export function PulsePage({ onOpenMember }: PulsePageProps) {
  const activities = useMemo(() => getPulseActivitiesWithContext(), [])
  const sections: PulseSection[] = ['network', 'nearby', 'growth']

  return (
    <main className="pulse-screen">
      <header className="pulse-hero">
        <p className="network-kicker">نمونه‌ی اولیه پژوهشی</p>
        <h1>نبض قبیله</h1>
        <p>وقتی وارد مونوترایب می‌شوید، اینجا نشان می‌دهد در جهان قابل اعتماد اطراف شما چه چیزهایی تغییر کرده است.</p>
      </header>

      <div className="pulse-layout">
        {sections.map((section) => {
          const sectionActivities = activities.filter((activity) => activity.section === section)

          return (
            <section className="pulse-section" key={section}>
              <div className="pulse-section-heading">
                <div>
                  <h2>{sectionLabels[section]}</h2>
                  <p>{sectionDescriptions[section]}</p>
                </div>
                <span>{toPersianDigits(sectionActivities.length)} مورد</span>
              </div>

              <div className="pulse-list">
                {sectionActivities.map((activity) => (
                  <PulseCard key={activity.id} activity={activity} onOpenMember={onOpenMember} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}

function PulseCard({
  activity,
  onOpenMember,
}: {
  activity: PulseActivityWithContext
  onOpenMember: (memberId: string) => void
}) {
  const primaryPerson = activity.people[0]

  return (
    <article className={`pulse-card pulse-card-${activity.type}`}>
      <div className="pulse-card-top">
        {primaryPerson?.avatar ? <img src={primaryPerson.avatar} alt="" /> : <div className="pulse-avatar-fallback" />}
        <div>
          <span>{activity.typeLabel}</span>
          <h3>{activity.description}</h3>
          <p>{activity.timestampLabel}</p>
        </div>
      </div>

      <div className="pulse-context">
        <strong>{formatDistance(activity.distance)}</strong>
        <span>{activity.relevance}</span>
        {activity.pathNames ? (
          <p>
            <PersonPathPopoverList
              memberIds={activity.pathMemberIds}
              fallback={activity.pathNames}
              onOpenMember={onOpenMember}
            />
          </p>
        ) : null}
      </div>

      {activity.people.length > 0 ? (
        <div className="pulse-people-row">
          <span>افراد مرتبط:</span>
          <div>
            {activity.people.map((person) => (
              <PersonNamePopover key={person.id} memberId={person.id} onOpenMember={onOpenMember}>
                {person.displayName}
              </PersonNamePopover>
            ))}
          </div>
        </div>
      ) : null}

      <div className="pulse-card-footer">
        {activity.city ? <span>{activity.city}</span> : <span>کل شبکه</span>}
        {activity.actionLabel ? <button type="button">{activity.actionLabel}</button> : null}
      </div>
    </article>
  )
}

function formatDistance(distance: number | null) {
  if (distance === null) return 'مسیر نامشخص'
  if (distance === 0) return 'از نقطه شروع شبکه شما'

  return `${toPersianDigits(distance)} ارتباط با شما فاصله دارد`
}

function toPersianDigits(value: number) {
  return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value)
}
