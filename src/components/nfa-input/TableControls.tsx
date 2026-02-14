import { useNFA } from '../../hooks/useNFA';
import { useState } from 'react';

export function TableControls() {
  const { nfa, addState, removeState, updateState, clearNFA } = useNFA();
  const [newLabel, setNewLabel] = useState('');

  const handleAddState = () => {
    const label = newLabel.trim() || `q${nfa.states.length}`;
    const isStart = nfa.states.length === 0;
    addState(label, isStart, false);
    setNewLabel('');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">States</h3>

      {nfa.states.length > 0 ? (
        <div className="space-y-1.5">
          {nfa.states.map(s => (
            <div
              key={s.id}
              className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5"
            >
              <span className="text-sm font-mono font-medium flex-1">{s.label}</span>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={s.isStart}
                  onChange={e => updateState(s.id, { isStart: e.target.checked })}
                  className="rounded"
                />
                Start
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={s.isFinal}
                  onChange={e => updateState(s.id, { isFinal: e.target.checked })}
                  className="rounded"
                />
                Final
              </label>
              <button
                onClick={() => removeState(s.id)}
                className="text-red-400 hover:text-red-600 text-xs ml-1"
                title="Remove state"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No states yet. Add one to get started.</p>
      )}

      {/* Add state form */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder={`q${nfa.states.length}`}
          onKeyDown={e => e.key === 'Enter' && handleAddState()}
          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <button
          onClick={handleAddState}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Add State
        </button>
      </div>

      {nfa.states.length > 0 && (
        <button
          onClick={clearNFA}
          className="w-full px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
