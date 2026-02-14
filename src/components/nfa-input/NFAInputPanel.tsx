import { TableControls } from './TableControls';
import { TransitionTable } from './TransitionTable';
import { useNFA } from '../../hooks/useNFA';
import { useConversion } from '../../hooks/useConversion';
import { useState } from 'react';

export function NFAInputPanel() {
  const { validate } = useNFA();
  const { startConversion } = useConversion();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleConvert = () => {
    const result = validate();
    if (result.valid) {
      setValidationErrors([]);
      startConversion();
    } else {
      setValidationErrors(result.errors);
    }
  };

  return (
    <div className="space-y-5">
      <TableControls />
      <TransitionTable />

      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm font-medium text-red-700 mb-1">Validation Errors:</p>
          <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleConvert}
        className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 shadow-sm transition-colors"
      >
        Convert to Regex →
      </button>
    </div>
  );
}
