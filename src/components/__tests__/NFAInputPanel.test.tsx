import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('NFAInputPanel — adding states', () => {
  it('clicking "+ State" makes "Convert to Regex" button enabled', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Convert to Regex/i })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /\+ State/i }))
    expect(screen.getByRole('button', { name: /Convert to Regex/i })).not.toBeDisabled()
  })

  it('clicking "+ State" twice keeps "Convert to Regex" enabled', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    await userEvent.click(screen.getByRole('button', { name: /\+ State/i }))
    await userEvent.click(screen.getByRole('button', { name: /\+ State/i }))
    expect(screen.getByRole('button', { name: /Convert to Regex/i })).not.toBeDisabled()
  })

  it('shows validation errors when attempting to convert an NFA with no final state', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    await userEvent.click(screen.getByRole('button', { name: /\+ State/i }))
    await userEvent.click(screen.getByRole('button', { name: /Convert to Regex/i }))
    // Multiple elements may contain "final" (error message + notification) — at least one must exist
    expect(screen.getAllByText(/NFA must have at least one final/i).length).toBeGreaterThan(0)
  })
})

describe('NFAInputPanel — symbol management', () => {
  it('typing a symbol and pressing Enter clears the input field', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/Add symbol/i)
    await userEvent.type(input, 'a{Enter}')
    expect(input).toHaveValue('')
  })

  it('typing a symbol and pressing Enter shows a remove (×) button for the chip', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/Add symbol/i)
    await userEvent.type(input, 'a{Enter}')
    expect(screen.getByTitle(/Remove symbol/i)).toBeInTheDocument()
  })

  it('clicking "+ Symbol" button adds the symbol and clears the input', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/Add symbol/i)
    await userEvent.type(input, 'b')
    await userEvent.click(screen.getByRole('button', { name: /\+ Symbol/i }))
    expect(input).toHaveValue('')
    expect(screen.getByTitle(/Remove symbol/i)).toBeInTheDocument()
  })

  it('adding the same symbol twice does not create a duplicate chip', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/Add symbol/i)
    await userEvent.type(input, 'a{Enter}')
    await userEvent.type(input, 'a{Enter}')
    expect(screen.getAllByTitle(/Remove symbol/i)).toHaveLength(1)
  })

  it('clicking the × button removes the symbol chip', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/Add symbol/i)
    await userEvent.type(input, 'a{Enter}')
    await userEvent.click(screen.getByTitle(/Remove symbol/i))
    expect(screen.queryByTitle(/Remove symbol/i)).not.toBeInTheDocument()
  })
})

describe('NFAInputPanel — examples panel', () => {
  it('clicking "Load Examples" changes button label to "Hide Examples"', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    await userEvent.click(screen.getByRole('button', { name: /Load Examples/i }))
    expect(screen.getByRole('button', { name: /Hide Examples/i })).toBeInTheDocument()
  })

  it('clicking "Hide Examples" hides the panel again', async () => {
    render(<NFAInputPanel />, { wrapper: Wrapper })
    await userEvent.click(screen.getByRole('button', { name: /Load Examples/i }))
    await userEvent.click(screen.getByRole('button', { name: /Hide Examples/i }))
    expect(screen.getByRole('button', { name: /Load Examples/i })).toBeInTheDocument()
  })
})
