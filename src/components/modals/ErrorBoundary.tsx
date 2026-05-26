import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center bg-surface">
        <AlertTriangle size={48} className="text-error" strokeWidth={1.5} />
        <h1 className="text-headline-md text-on-surface font-bold">Something went wrong</h1>
        <p className="text-body-sm text-on-surface-variant max-w-sm">{this.state.error?.message}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-2">Reload App</button>
      </div>
    )
    return this.props.children
  }
}
