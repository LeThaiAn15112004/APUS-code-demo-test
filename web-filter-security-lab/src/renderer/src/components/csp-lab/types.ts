export type CspLogHandler = (message: string) => void

export interface CspCasePageProps {
  addLog: CspLogHandler
  isDev: boolean
}

export interface CspCaseRoute {
  id: string
  label: string
  title: string
  summary: string
  Page: (props: CspCasePageProps) => React.JSX.Element
}
