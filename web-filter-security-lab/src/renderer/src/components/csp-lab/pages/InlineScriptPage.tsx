import type { CspCasePageProps } from '../types'

function InlineScriptPage({ addLog, isDev }: CspCasePageProps): React.JSX.Element {
  const runAttack = (): void => {
    window.__cspInlineScriptRan = false
    const script = document.createElement('script')
    script.textContent = "window.__cspInlineScriptRan = true; alert('inline script da chay')"
    document.body.appendChild(script)

    window.setTimeout(() => {
      addLog(
        window.__cspInlineScriptRan
          ? isDev
            ? "[DEV] Inline script da chay vi dev CSP dang bat 'unsafe-inline' cho Vite/React."
            : '[DANGER] Inline script da chay. CSP script-src dang qua long.'
          : '[OK] Inline script bi chan. Day la case XSS co dien: <script>...</script>.'
      )
      script.remove()
    }, 80)
  }

  return (
    <article className="csp-case-page">
      <h3>Inline script injection</h3>
      <p>
        Case nay mo phong viec attacker chen truc tiep the <code>script</code> vao DOM. Trong
        production, policy khong co <code>'unsafe-inline'</code> nen browser phai chan. Trong dev,
        Vite can inline preamble de React render, nen case nay se duoc mo rieng cho dev.
      </p>
      <pre>{`<script>alert('XSS')</script>`}</pre>
      <button type="button" onClick={runAttack}>
        Run inline script test
      </button>
    </article>
  )
}

export default InlineScriptPage
