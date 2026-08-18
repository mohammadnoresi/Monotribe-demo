import { useMemo, useState } from 'react'
import { PersonNamePopover, PersonPathPopoverList } from '../components/PersonNamePopover.tsx'
import { filterSocialItems, getSocialItemsWithContext } from '../data/community/socialSelectors.ts'
import type { DistanceFilter, KindFilter, LocationFilter, SocialItemKind, SocialItemWithContext } from '../types/social.ts'
import type { ReactNode } from 'react'

type ResponseState = Record<string, string>

const kindLabels: Record<SocialItemKind, string> = {
  event: 'رویداد',
  help: 'درخواست کمک',
  companionship: 'همراهی',
  offer: 'پیشنهاد کمک',
}

const responseDoneLabel: Record<SocialItemKind, string> = {
  event: 'حضور شما ثبت شد',
  help: 'آمادگی شما ثبت شد',
  companionship: 'همراهی شما ثبت شد',
  offer: 'درخواست شما ثبت شد',
}

type RequestsPageProps = {
  onOpenMember: (memberId: string) => void
}

export function RequestsPage({ onOpenMember }: RequestsPageProps) {
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('5')
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all')
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [responses, setResponses] = useState<ResponseState>({})

  const allItems = useMemo(() => getSocialItemsWithContext(), [])
  const filteredItems = useMemo(
    () =>
      filterSocialItems(allItems, {
        distance: distanceFilter,
        location: locationFilter,
        kind: kindFilter,
      }),
    [allItems, distanceFilter, kindFilter, locationFilter],
  )

  const counts = useMemo(
    () => ({
      event: allItems.filter((item) => item.kind === 'event').length,
      help: allItems.filter((item) => item.kind === 'help').length,
      companionship: allItems.filter((item) => item.kind === 'companionship').length,
      offer: allItems.filter((item) => item.kind === 'offer').length,
    }),
    [allItems],
  )

  return (
    <main className="requests-screen">
      <header className="requests-hero">
        <div>
          <p className="network-kicker">نمونه‌ی اولیه پژوهشی</p>
          <h1>درخواست‌ها و همراهی</h1>
          <p>
            اینجا ارزش شبکه اعتماد دیده می‌شود: هر درخواست، رویداد یا پیشنهاد کمک فقط وقتی معنا دارد که بدانیم
            از چه مسیری به ما وصل شده است.
          </p>
        </div>
        <div className="requests-summary" aria-label="خلاصه موارد">
          <span>{toPersianDigits(counts.event)} رویداد</span>
          <span>{toPersianDigits(counts.help + counts.companionship)} درخواست</span>
          <span>{toPersianDigits(counts.offer)} پیشنهاد کمک</span>
        </div>
      </header>

      <section className="request-filters" aria-label="فیلتر درخواست‌ها">
        <FilterGroup label="فاصله">
          <FilterButton active={distanceFilter === '1'} onClick={() => setDistanceFilter('1')}>
            ۱ ارتباط
          </FilterButton>
          <FilterButton active={distanceFilter === '2'} onClick={() => setDistanceFilter('2')}>
            تا ۲ ارتباط
          </FilterButton>
          <FilterButton active={distanceFilter === '3'} onClick={() => setDistanceFilter('3')}>
            تا ۳ ارتباط
          </FilterButton>
          <FilterButton active={distanceFilter === '5'} onClick={() => setDistanceFilter('5')}>
            تا ۵ ارتباط
          </FilterButton>
          <FilterButton active={distanceFilter === 'all'} onClick={() => setDistanceFilter('all')}>
            همه
          </FilterButton>
        </FilterGroup>

        <FilterGroup label="مکان">
          <FilterButton active={locationFilter === 'all'} onClick={() => setLocationFilter('all')}>
            همه شهرها
          </FilterButton>
          <FilterButton active={locationFilter === 'tehran'} onClick={() => setLocationFilter('tehran')}>
            تهران
          </FilterButton>
          <FilterButton active={locationFilter === 'other'} onClick={() => setLocationFilter('other')}>
            شهرهای دیگر
          </FilterButton>
        </FilterGroup>

        <FilterGroup label="نوع">
          <FilterButton active={kindFilter === 'all'} onClick={() => setKindFilter('all')}>
            همه
          </FilterButton>
          <FilterButton active={kindFilter === 'event'} onClick={() => setKindFilter('event')}>
            رویداد
          </FilterButton>
          <FilterButton active={kindFilter === 'help'} onClick={() => setKindFilter('help')}>
            کمک
          </FilterButton>
          <FilterButton active={kindFilter === 'companionship'} onClick={() => setKindFilter('companionship')}>
            همراهی
          </FilterButton>
          <FilterButton active={kindFilter === 'offer'} onClick={() => setKindFilter('offer')}>
            پیشنهاد کمک
          </FilterButton>
        </FilterGroup>
      </section>

      <section className="request-grid" aria-label="فهرست درخواست‌ها و رویدادها">
        {filteredItems.map((item) => (
          <SocialItemCard
            key={item.id}
            item={item}
            responseLabel={responses[item.id]}
            onOpenMember={onOpenMember}
            onRespond={() =>
              setResponses((currentResponses) => ({
                ...currentResponses,
                [item.id]: responseDoneLabel[item.kind],
              }))
            }
          />
        ))}
        {filteredItems.length === 0 ? (
          <div className="request-empty-state">
            <h2>موردی با این فیلترها پیدا نشد</h2>
            <p>برای مصاحبه می‌توانیم فاصله یا نوع درخواست را بازتر کنیم تا مسیرهای بیشتری از شبکه دیده شود.</p>
          </div>
        ) : null}
      </section>
    </main>
  )
}

function SocialItemCard({
  item,
  responseLabel,
  onOpenMember,
  onRespond,
}: {
  item: SocialItemWithContext
  responseLabel?: string
  onOpenMember: (memberId: string) => void
  onRespond: () => void
}) {
  return (
    <article className={`request-card request-card-${item.kind}`}>
      <div className="request-card-top">
        <img src={item.personAvatar} alt="" />
        <div>
          <span className="request-type">{kindLabels[item.kind]}</span>
          <h2>{item.title}</h2>
          <p>
            <PersonNamePopover memberId={item.personId} onOpenMember={onOpenMember}>
              {item.personName}
            </PersonNamePopover>
            ، {item.personProfession}
          </p>
        </div>
      </div>

      <p className="request-description">{item.description}</p>

      <dl className="request-meta">
        <div>
          <dt>مکان</dt>
          <dd>
            {item.city}، {item.location}
          </dd>
        </div>
        <div>
          <dt>زمان</dt>
          <dd>{item.dateLabel}</dd>
        </div>
        {item.urgency ? (
          <div>
            <dt>فوریت</dt>
            <dd>{item.urgency}</dd>
          </div>
        ) : null}
        {item.neededCount ? (
          <div>
            <dt>ظرفیت</dt>
            <dd>
              {toPersianDigits(item.participantCount ?? 0)} از {toPersianDigits(item.neededCount)} نفر
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="relationship-context-box">
        <strong>{formatDistance(item.distance)}</strong>
        <span>{item.relationshipContext}</span>
        <p>
          <PersonPathPopoverList
            memberIds={item.pathMemberIds}
            fallback={item.pathNames}
            onOpenMember={onOpenMember}
          />
        </p>
      </div>

      <button type="button" className={responseLabel ? 'request-action is-done' : 'request-action'} onClick={onRespond}>
        {responseLabel ?? item.actionLabel}
      </button>
    </article>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="filter-group">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  )
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button type="button" className={active ? 'is-active' : ''} onClick={onClick}>
      {children}
    </button>
  )
}

function formatDistance(distance: number | null) {
  if (distance === null) return 'مسیر نامشخص'
  if (distance === 0) return 'از طرف شما'

  return `${toPersianDigits(distance)} ارتباط با شما فاصله دارد`
}

function toPersianDigits(value: number) {
  return new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(value)
}
