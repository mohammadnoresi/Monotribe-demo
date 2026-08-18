import type { FriendPathResult } from '../utils/friendPath.ts'
import type { TrustProfileContext } from '../data/community/profileData.ts'
import { primaryDemoUserId } from '../data/community/index.ts'

type MemberTrustProfileProps = {
  profile: TrustProfileContext
  avatarUrl: string
  path: FriendPathResult
  pathNames: string
  onClose: () => void
}

export function MemberTrustProfile({ profile, avatarUrl, path, pathNames, onClose }: MemberTrustProfileProps) {
  const { member, sponsor } = profile

  return (
    <section className="profile-drawer" aria-label={`پروفایل ${member.displayName}`}>
      <header className="profile-header">
        <button type="button" className="profile-close-button" onClick={onClose}>
          بستن
        </button>
        <div className="profile-identity">
          <img src={avatarUrl} alt="" className="profile-avatar" />
          <div>
            <p className="profile-kicker">پروفایل اعتماد</p>
            <h2>{member.displayName}</h2>
            <p className="profile-summary">
              {member.city}، {member.profession}
            </p>
            <p className="identity-status">{member.verified ? 'هویت تأیید شده ✓' : 'هویت در انتظار تأیید'}</p>
          </div>
        </div>
      </header>

      <div className="profile-content">
        <section className="profile-section">
          <h3>هویت</h3>
          <p>{member.bio}</p>
        </section>

        <section className="profile-section">
          <h3>عضویت</h3>
          <dl className="profile-facts">
            <div>
              <dt>تاریخ عضویت</dt>
              <dd>{formatDate(member.joinedDate)}</dd>
            </div>
            <div>
              <dt>مدت عضویت</dt>
              <dd>{formatMembershipDuration(member.joinedDate)}</dd>
            </div>
            <div>
              <dt>عضو شده توسط</dt>
              <dd>{sponsor ? sponsor.displayName : member.id === primaryDemoUserId ? 'شروع‌کننده شبکه دمو' : 'ثبت نشده'}</dd>
            </div>
          </dl>
          {sponsor ? (
            <p className="profile-note">معرف یعنی کسی که این عضو را وارد مونوترایب کرده است.</p>
          ) : null}
        </section>

        <section className="profile-section">
          <h3>زمینه اعتماد در شبکه</h3>
          <div className="trust-metrics">
            <div>
              <strong>{toPersianDigits(profile.realWorldConnectionCount)}</strong>
              <span>نفر این شخص را در دنیای واقعی می‌شناسند</span>
            </div>
            <div>
              <strong>{toPersianDigits(profile.trustedByCount)}</strong>
              <span>نفر او را در حلقه اعتماد خود قرار داده‌اند</span>
            </div>
            <div>
              <strong>{toPersianDigits(member.endorsementCount)}</strong>
              <span>تأییدیه نمونه در داده پژوهشی دارد</span>
            </div>
            <div>
              <strong>{toPersianDigits(member.contributionCount)}</strong>
              <span>مشارکت اجتماعی ثبت شده دارد</span>
            </div>
          </div>
        </section>

        <section className="profile-section connection-section">
          <h3>ارتباط با من</h3>
          <p className="connection-distance">{formatDistance(path.distance)}</p>
          <p className="connection-path">{pathNames || 'مسیر ارتباطی پیدا نشد.'}</p>
        </section>

        <section className="profile-section">
          <h3>نوع رابطه</h3>
          <div className="relationship-actions">
            {profile.relationshipActions.map((action) => (
              <button type="button" key={action.id}>
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h3>تأییدیه‌های نمونه</h3>
          <ul className="profile-list">
            {profile.endorsements.map((endorsement) => (
              <li key={endorsement}>{endorsement}</li>
            ))}
          </ul>
        </section>

        <section className="profile-section">
          <h3>چه کمکی از دست من برمی‌آید؟</h3>
          <div className="skill-list">
            {member.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h3>مشارکت‌های اجتماعی</h3>
          <ul className="profile-list">
            {profile.socialActivities.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

function formatMembershipDuration(date: string) {
  const joinedAt = new Date(`${date}T12:00:00`).getTime()
  const now = new Date('2026-08-18T12:00:00').getTime()
  const months = Math.max(0, Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24 * 30)))

  if (months < 1) return 'کمتر از یک ماه'
  if (months < 12) return `${toPersianDigits(months)} ماه`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) return `${toPersianDigits(years)} سال`

  return `${toPersianDigits(years)} سال و ${toPersianDigits(remainingMonths)} ماه`
}

function formatDistance(distance: number | null) {
  if (distance === null) return 'مسیر ارتباطی مشخصی با شما پیدا نشد'
  if (distance === 0) return 'این پروفایل متعلق به شماست'

  return `شما ${toPersianDigits(distance)} ارتباط فاصله دارید`
}

function toPersianDigits(value: number) {
  return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value)
}
