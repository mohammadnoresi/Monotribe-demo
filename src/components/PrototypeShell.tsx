import type { LandingCopy } from '../types/prototype.ts'

type PrototypeShellProps = {
  copy: LandingCopy
}

export function PrototypeShell({ copy }: PrototypeShellProps) {
  return (
    <main className="page-shell">
      <section className="prototype-shell" aria-labelledby="prototype-title">
        <div className="prototype-heading">
          <p className="prototype-label">{copy.label}</p>
          <h1 id="prototype-title">{copy.title}</h1>
        </div>

        <div className="prototype-placeholder">
          <p>{copy.placeholder}</p>
        </div>
      </section>
    </main>
  )
}
