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

  it('shows "Not quite" feedback after selecting a wrong template', async () => {
    // Arrange
    await startWith('a')

    // Act — "a" requires "Base — symbol"; selecting union is wrong
    await userEvent.click(screen.getByRole('button', { name: /Union/i }))

    // Assert
    expect(screen.getByText(/Not quite/i)).toBeInTheDocument()
  })

  it('shows "✓ Correct" and a Next/Finish button after selecting the right template', async () => {
    // Arrange
    await startWith('a')

    // Act — correct template for a single symbol is "Base — symbol"
    await userEvent.click(screen.getByRole('button', { name: /Base.*symbol/i }))

    // Assert
    expect(screen.getByText(/Correct/i)).toBeInTheDocument()
    // Single-step regex → "Finish Construction"
    expect(screen.getByRole('button', { name: /Finish Construction/i })).toBeInTheDocument()
  })

  it('auto-fills the correct template when the Skip link is clicked', async () => {
    // Arrange
    await startWith('a')

    // Act
    await userEvent.click(screen.getByText(/Skip/i))

    // Assert
    expect(screen.getByText(/Correct/i)).toBeInTheDocument()
  })

  it('returns to idle mode when the Reset button is clicked mid-stepping', async () => {
    // Arrange
    await startWith('a')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Reset/i }))

    // Assert
    expect(screen.getByRole('button', { name: /Start Construction/i })).toBeInTheDocument()
  })
})

describe('RegexToNFAPanel — complete phase', () => {
  async function completeConstruction(regex = 'a') {
    render(<RegexToNFAPanel />, { wrapper: Wrapper })
    const input = screen.getByPlaceholderText(/a\+b/i)
    await userEvent.type(input, regex)
    await userEvent.click(screen.getByRole('button', { name: /Start Construction/i }))
    // Skip all steps to finish quickly
    let iterations = 0
    while (iterations < 20) {
      iterations++
      if (screen.queryByText(/Construction complete/i)) break
      const skip = screen.queryByText(/Skip/i)
      if (skip) { await userEvent.click(skip); continue }
      const finish = screen.queryByRole('button', { name: /Finish Construction/i })
      if (finish) { await userEvent.click(finish); continue }
      const next = screen.queryByRole('button', { name: /Next Step/i })
      if (next) { await userEvent.click(next); continue }
      break
    }
  }

  it('shows "Construction complete!" after all steps are confirmed', async () => {
    // Arrange + Act
    await completeConstruction('a')

    // Assert
    expect(screen.getByText(/Construction complete/i)).toBeInTheDocument()
  })

  it('shows the export button in the complete phase', async () => {
    // Arrange + Act
    await completeConstruction('a')

    // Assert
    expect(screen.getByRole('button', { name: /Export Final NFA/i })).toBeInTheDocument()
  })

  it('returns to idle phase after clicking Reset in the complete phase', async () => {
    // Arrange
    await completeConstruction('a')

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Reset/i }))

    // Assert
    expect(screen.getByRole('button', { name: /Start Construction/i })).toBeInTheDocument()
  })
})
