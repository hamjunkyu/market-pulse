'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900">문제가 발생했습니다</p>
          <p className="mt-2 text-sm text-muted-foreground">페이지를 새로고침해 주세요.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
