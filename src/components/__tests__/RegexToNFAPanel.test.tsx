import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProvider } from '../../state/AppContext'
import { NotificationProvider } from '../layout/NotificationArea'
import { RegexToNFAPanel } from '../conversion/RegexToNFAPanel'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AppProvider>{children}</AppProvider>
    </NotificationProvider>
  )
}

describe('RegexToNFAPanel — idle mode', () => {
  it("renders the panel heading \"Thompson's Construction\"", () => {
    render(<RegexToNFAPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Thompson's Construction/i })).toBeInTheDocument()
  })

  it('renders the regex input field', () => {
    render(<RegexToNFAPanel />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText(/a\+b/i)).toBeInTheDocument()
  })

  it('renders the "Load Examples" button', () => {
    render(<RegexToNFAPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Load Examples/i })).toBeInTheDocument()
  })

  it('renders the "Start Construction" button', () => {
    render(<RegexToNFAPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Start Construction/i })).toBeInTheDocument()
  })

  it('"Start Construction" is disabled when the input is empty', () => {
    render(<RegexToNFAPanel />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Start Construction/i })).toBeDisabled()
  })

  it('"Start Construction" becomes enabled after typing a regex', async () => {
    render(<RegexToNFAPanel />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/a\+b/i)
    await userEvent.type(input, 'a')
    expect(screen.getByRole('button', { name: /Start Construction/i })).not.toBeDisabled()
  })
})

describe('RegexToNFAPanel — stepping mode', () => {
  async function startWith(regex: string) {
    render(<RegexToNFAPanel />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/a\+b/i)
    await userEvent.type(input, regex)
    await userEvent.click(screen.getByRole('button', { name: /Start Construction/i }))
  }

  it('shows all 5 template buttons after starting construction', async () => {
    await startWith('a')
    expect(screen.getByRole('button', { name: /Base.*symbol/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Base.*ε/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Union/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Concatenation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Kleene Star/i })).toBeInTheDocument()
  })

  it('shows the "Skip" / auto-complete link', async () => {
    await startWith('a')
    expect(screen.getByText(/Skip/i)).toBeInTheDocument()
  })

  it('shows the "← Reset" button', async () => {
    await startWith('a')
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
  })
})
