import type { CspCasePageProps } from '../types'

function RemoteImagePage({ addLog }: CspCasePageProps): React.JSX.Element {
  const runAttack = (): void => {
    const img = document.createElement('img')
    img.alt = 'remote tracking pixel'
    img.src = 'https://evil.example/tracker.png'
    img.onload = () => addLog('[DANGER] Remote image da load, co the bi dung lam tracking pixel.')
    img.onerror = () => addLog('[OK] Remote image bi chan/khong load duoc boi img-src.')
    document.body.appendChild(img)

    window.setTimeout(() => img.remove(), 1500)
  }

  return (
    <article className="csp-case-page">
      <h3>Remote image tracking pixel</h3>
      <p>
        Anh ngoai domain co the bi dung de tracking hoac leak thong tin qua URL. Policy
        <code> img-src 'self' data:</code> chi cho anh trong app va data URI.
      </p>
      <pre>{`<img src="https://evil.example/tracker.png">`}</pre>
      <button type="button" onClick={runAttack}>
        Run remote image test
      </button>
    </article>
  )
}

export default RemoteImagePage
