# NFA ↔ Regex Converter

An interactive web application for converting between Non-deterministic Finite Automata (NFA) and regular expressions. Built with React, TypeScript, and React Flow.

The app supports two directions:

- **NFA → Regex** — construct an NFA via a transition table, then step through the **State Elimination** algorithm to derive the equivalent regular expression.
- **Regex → NFA** — enter a regular expression and have the equivalent NFA generated and displayed on the canvas through **Thompson's construction** algorithm.

---

## What it does

Switch between modes using the header. In both modes the automaton is displayed on an interactive canvas on the right, and controls appear in the resizable sidebar on the left.

### Visual conventions

- **Start state** — always shown with a **green outline** and a **green arrow pointing into it** from the left. There is exactly one start state per automaton.
- **Accept states** — shown with a double-ring border.
- **Transitions** — labelled directed edges between states. Multiple symbols on the same transition are separated by commas.

---

## Getting started

### Prerequisites

Node.js **20.19+** or **22.12+** is required (the project uses Vite 7).

> If you cannot upgrade Node (e.g. on a university lab machine running Node 18), open `package.json` and change `"vite": "^7.3.1"` to `"vite": "^5.4.11"` before continuing.

### Installation

```bash
# Install all dependencies (run this once before anything else)
npm install
```

### Running locally

```bash
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`) in your browser.

---

## Usage

### NFA → Regex

1. **Build your NFA** — use the sidebar to add states and fill in the transition table. Mark one state as the start state and at least one as an accept state.
2. **Start conversion** — click the *Convert* button to enter the step-by-step state elimination view.
3. **Step through** — eliminate states one at a time and watch the equivalent regular expression being built up on screen.
4. **Result** — once all intermediate states are removed the final regular expression is displayed.

### Regex → NFA

1. **Enter a regex** — type a regular expression into the input field in the sidebar.
2. **Generate** — the equivalent NFA is constructed and rendered on the canvas automatically.

---

## Development

```bash
# Run the test suite
npm run test

# Run tests with coverage report
npm test -- --coverage
```

Tests use Vitest and React Testing Library. Coverage output goes to the terminal and an HTML report under `coverage/`.
