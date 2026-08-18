import type { ParsedInvitationLink } from '../types/invitation.ts'

export function InvitationLandingPage({ invitation }: { invitation: ParsedInvitationLink }) {
  return (
    <main className="invite-screen invitation-route-screen">
      <section className="invitation-route-card">
        <p className="network-kicker">دعوتنامه مونوترایب</p>
        {invitation.isValid ? (
          <>
            <h1>
              {invitation.invitedName} توسط {invitation.sponsorName} به مونوترایب دعوت شده است.
            </h1>
            <p>
              این دعوت به نام همین فرد، شناسه همین دعوتنامه و اسپانسر مشخص‌شده گره خورده است. اگر نام یا اسپانسر
              تغییر کند، این لینک دیگر با دعوتنامه هم‌خوان نیست.
            </p>
            <div className="landing-sponsor-box">
              <strong>چرا این دعوت وجود دارد؟</strong>
              <span>
                چون {invitation.sponsorName} پذیرفته این فرد را به قبیله معرفی کند. اسپانسر بودن یک رابطه تاریخی
                معرفی است، نه پاداش دعوت یا شاخص محبوبیت.
              </span>
            </div>
            <button type="button">پذیرش دعوت در نمونه اولیه</button>
          </>
        ) : (
          <>
            <h1>این لینک دعوت با اطلاعات دعوتنامه هم‌خوان نیست.</h1>
            <p>در نمونه اولیه، لینک دعوت فقط برای همان ترکیب اسپانسر، فرد دعوت‌شونده و شناسه دعوت معتبر است.</p>
          </>
        )}
      </section>
    </main>
  )
}
