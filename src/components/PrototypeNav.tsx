import type { AppSection } from '../types/navigation.ts'

type PrototypeNavProps = {
  currentSection: AppSection
  onNavigate: (section: AppSection) => void
}

export function PrototypeNav({ currentSection, onNavigate }: PrototypeNavProps) {
  return (
    <nav className="prototype-nav" aria-label="ناوبری نمونه اولیه">
      <button
        type="button"
        className={currentSection === 'graph' ? 'is-active' : ''}
        onClick={() => onNavigate('graph')}
      >
        شبکه دوستان
      </button>
      <button
        type="button"
        className={currentSection === 'requests' ? 'is-active' : ''}
        onClick={() => onNavigate('requests')}
      >
        درخواست‌ها و همراهی
      </button>
      <button
        type="button"
        className={currentSection === 'pulse' ? 'is-active' : ''}
        onClick={() => onNavigate('pulse')}
      >
        نبض قبیله
      </button>
      <button
        type="button"
        className={currentSection === 'invite' ? 'is-active' : ''}
        onClick={() => onNavigate('invite')}
      >
        دعوت مسئولانه
      </button>
    </nav>
  )
}
