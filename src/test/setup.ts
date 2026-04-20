import '@testing-library/jest-dom'
import { vi } from 'vitest'

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => {
          const React = require('react')
          return React.createElement(tag, props, children)
        },
    }
  ),
}))
