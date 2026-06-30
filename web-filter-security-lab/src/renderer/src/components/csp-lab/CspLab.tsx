import { useEffect, useMemo, useState } from 'react'
import ExternalScriptPage from './pages/ExternalScriptPage'
import FetchLeakPage from './pages/FetchLeakPage'
import FramePage from './pages/FramePage'
import InlineEventPage from './pages/InlineEventPage'
import InlineScriptPage from './pages/InlineScriptPage'
import RemoteImagePage from './pages/RemoteImagePage'
import type { CspCaseRoute } from './types'

const cspCases: CspCaseRoute[] = [
  {
    id: 'inline-script',
    label: 'Inline script',
    title: 'Inline script injection',
    summary: 'Thu chen <script> truc tiep vao DOM.',
    Page: InlineScriptPage
  },
  {
    id: 'external-script',
    label: 'External script',
    title: 'External script',
    summary: 'Thu nap JavaScript tu domain khong nam trong allowlist.',
    Page: ExternalScriptPage
  },
  {
    id: 'inline-event',
    label: 'img onerror',
    title: 'Inline event handler',
    summary: 'Thu payload <img onerror=...> hay gap trong XSS.',
    Page: InlineEventPage
  },
  {
    id: 'remote-image',
    label: 'Remote image',
    title: 'Remote image',
    summary: 'Thu tracking pixel/image tu domain la.',
    Page: RemoteImagePage
  },
  {
    id: 'fetch-leak',
    label: 'Fetch leak',
    title: 'Fetch leak',
    summary: 'Thu gui du lieu ra endpoint ben ngoai.',
    Page: FetchLeakPage
  },
  {
    id: 'frame',
    label: 'Phishing iframe',
    title: 'Phishing iframe',
    summary: 'Thu chen iframe login gia tu domain la.',
    Page: FramePage
  }
]

function CspLab(): React.JSX.Element {
  const isDev = import.meta.env.DEV
  const [activeCaseId, setActiveCaseId] = useState<string>(cspCases[0].id)
  const [cspLogs, setCspLogs] = useState<string[]>([
    'Chon mot trang test, bam Run, roi mo F12 Console de xem CSP violation chi tiet.'
  ])

  const activeCase = useMemo(
    () => cspCases.find((cspCase) => cspCase.id === activeCaseId) ?? cspCases[0],
    [activeCaseId]
  )
  const ActivePage = activeCase.Page

  useEffect(() => {
    const onCspViolation = (event: SecurityPolicyViolationEvent): void => {
      setCspLogs((current) => [
        `[CSP blocked] directive=${event.violatedDirective}; blocked=${event.blockedURI || 'inline'}`,
        ...current
      ])
    }

    document.addEventListener('securitypolicyviolation', onCspViolation)
    return () => document.removeEventListener('securitypolicyviolation', onCspViolation)
  }, [])

  const addLog = (message: string): void => {
    setCspLogs((current) => [message, ...current].slice(0, 12))
  }

  return (
    <section className="csp-lab">
      <div className="csp-lab-header">
        <div>
          <h2>CSP attack lab</h2>
          <p>
            Policy chung tu Main process. Dev mode noi <code>script-src</code> vua du cho Vite
            chay; production strict hon de chan inline script.
          </p>
        </div>
      </div>

      <div className="csp-page-layout">
        <nav className="csp-sidebar" aria-label="CSP test pages">
          {cspCases.map((cspCase) => (
            <button
              key={cspCase.id}
              type="button"
              className={activeCaseId === cspCase.id ? 'active' : ''}
              onClick={() => setActiveCaseId(cspCase.id)}
            >
              <span>{cspCase.label}</span>
              <small>{cspCase.summary}</small>
            </button>
          ))}
        </nav>

        <div className="csp-page-panel">
          <div className="csp-page-title">
            <span>Current page</span>
            <strong>{activeCase.title}</strong>
          </div>
          <ActivePage addLog={addLog} isDev={isDev} />
        </div>
      </div>

      <div className="csp-notes">
        <p>
          CSP giup giam thiet hai khi XSS chen duoc HTML vao trang. No khong thay the viec validate
          input, dung <code>textContent</code>, va thiet ke IPC an toan.
        </p>
      </div>

      <div className="csp-log" aria-live="polite">
        {cspLogs.map((log, index) => (
          <div key={`${log}-${index}`}>{log}</div>
        ))}
      </div>
    </section>
  )
}

export default CspLab
