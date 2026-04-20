import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProvider } from '../../state/AppContext'
import { NotificationProvider } from '../layout/NotificationArea'
import { NFAInputPanel } from '../nfa-input/NFAInputPanel'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AppProvider>{children}</AppProvider>
    </NotificationProvider>
  )
}

describe('NFAInputPanel — NFA-to-Regex input mode buttons', () => {
  it('renders the "+ Symbol" button', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /\+ Symbol/i })).toBeInTheDocument()
  })

  it('renders the "+ State" button', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /\+ State/i })).toBeInTheDocument()
  })

  it('renders the "- State" button', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /- State/i })).toBeInTheDocument()
  })

  it('renders the "Clear All" button', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
  })

  it('renders the "Load Examples" toggle button', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Load Examples/i })).toBeInTheDocument()
  })

  it('renders the export NFA button', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Export NFA/i })).toBeInTheDocument()
  })

  it('renders the import NFA button', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Import NFA/i })).toBeInTheDocument()
  })

  it('renders the "Convert to Regex" button', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Convert to Regex/i })).toBeInTheDocument()
  })

  it('"- State" button is disabled when no state is selected', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    const removeBtn = screen.getByRole('button', { name: /- State/i })
    expect(removeBtn).toBeDisabled()
  })

  it('"Convert to Regex" button is disabled when no states exist', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Convert to Regex/i })).toBeDisabled()
  })

  it('renders the symbol input placeholder', () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/Add symbol/i)).toBeInTheDocument()
  })
})
