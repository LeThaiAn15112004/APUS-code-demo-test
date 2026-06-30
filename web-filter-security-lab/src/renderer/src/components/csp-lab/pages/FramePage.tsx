import type { CspCasePageProps } from '../types'

function FramePage({ addLog }: CspCasePageProps): React.JSX.Element {
  const runAttack = (): void => {
    const frame = document.createElement('iframe')
    frame.src = 'https://evil.example/phishing-login'
    frame.onload = () => addLog('[DANGER] Iframe domain la da load duoc.')
    frame.onerror = () => addLog('[OK] Iframe domain la bi chan/khong load duoc.')
    document.body.appendChild(frame)

    window.setTimeout(() => {
      addLog('[INFO] Kiem tra them Console: CSP thuong bao frame-src violation cho iframe.')
      frame.remove()
    }, 1000)
  }

  return (
    <article className="csp-case-page">
      <h3>Phishing iframe</h3>
      <p>
        Iframe co the dung de nhoi man hinh login gia vao app. Directive
        <code> frame-src 'self'</code> chi cho frame cung nguon voi app.
      </p>
      <pre>{`<iframe src="https://evil.example/phishing-login"></iframe>`}</pre>
      <button type="button" onClick={runAttack}>
        Run iframe test
      </button>
    </article>
  )
}

export default FramePage
