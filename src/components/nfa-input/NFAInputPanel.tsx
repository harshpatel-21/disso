import { useState } from 'react'
import { useNFA } from '../../hooks/useNFA'
import { useConversion } from '../../hooks/useConversion'
import { useNotification } from '../layout/NotificationArea'
import { TableControls } from './TableControls'
import { TransitionTable } from './TransitionTable'
import { Button } from '../common/Button'
import { examples } from '../../data/examples'

export function NFAInputPanel() {
  const { nfa, validationErrors, validate, loadNFA } = useNFA()
  const { startConversion } = useConversion()
  const { notify } = useNotification()
  const [showExamples, setShowExamples] = useState(false)

  const handleStartConversion = () => {
    const errors = validate()
    if (errors.length > 0) {
      notify(errors[0]?.message ?? 'Validation failed', 'error')
      return
    }
    startConversion()
    notify('Conversion started — preprocessing complete', 'success')
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">NFA Input</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowExamples(!showExamples)}
        >
          {showExamples ? 'Hide' : 'Load'} Examples
        </Button>
      </div>

      {showExamples && (
        <div className="flex flex-col gap-1 rounded border border-gray-200 bg-gray-50 p-2">
          {examples.map((ex) => (
            <button
              key={ex.name}
              onClick={() => {
                loadNFA(ex.nfa)
                setShowExamples(false)
                notify(`Loaded: ${ex.name}`, 'success')
              }}
              className="flex flex-col rounded px-2 py-1.5 text-left hover:bg-white transition-colors cursor-pointer"
            >
              <span className="text-xs font-medium text-gray-700">
                {ex.name}
              </span>
              <span className="text-[10px] text-gray-500">
                {ex.description}
              </span>
            </button>
          ))}
        </div>
      )}

      <TableControls />
      <TransitionTable />
      {validationErrors.length > 0 && (
        <div className="rounded border border-red-200 bg-red-50 p-2">
          {validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-600">
              {err.message}
            </p>
          ))}
        </div>
      )}
      <Button
        onClick={handleStartConversion}
        disabled={nfa.states.length === 0}
        className="w-full"
      >
        Convert to Regex
      </Button>
    </div>
  )
}
