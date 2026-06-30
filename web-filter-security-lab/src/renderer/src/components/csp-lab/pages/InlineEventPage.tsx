import type { CspCasePageProps } from '../types'

function InlineEventPage({ addLog }: CspCasePageProps): React.JSX.Element {
  const runAttack = (): void => {
    const img = document.createElement('img')
    img.alt = 'broken image attack'
    img.src = 'x'
    img.setAttribute(
      'onerror',
      "window.__cspInlineEventRan = true; alert('onerror da chay')"
    )

    window.__cspInlineEventRan = false
    document.body.appendChild(img)

    window.setTimeout(() => {
      addLog(
        window.__cspInlineEventRan
          ? '[DANGER] Inline event onerror da chay.'
          : '[OK] Inline event handler bi chan. Payload <img onerror=...> khong chay.'
      )
      img.remove()
    }, 150)
  }

  return (
    <article className="csp-case-page">
      <h3>Inline event handler</h3>
      <p>
        Day la payload XSS hay gap khi app dung <code>innerHTML</code>. CSP khong cho inline
        handler, nen <code>onerror</code> khong duoc thuc thi.
      </p>
      <pre>{`<img src=x onerror="alert('XSS')">`}</pre>
      <button type="button" onClick={runAttack}>
        Run img onerror test
      </button>
    </article>
  )
}

export default InlineEventPage
