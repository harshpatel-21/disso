import { useNFA } from '../../hooks/useNFA';
import { useState } from 'react';

export function TransitionTable() {
  const { nfa, addTransition, removeTransition, updateTransition } = useNFA();
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  const handleAdd = () => {
    if (newSource && newTarget && newSymbol) {
      addTransition(newSource, newTarget, newSymbol);
      setNewSource('');
      setNewTarget('');
      setNewSymbol('');
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Transitions</h3>

      {nfa.transitions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left px-2 py-1.5 border-b border-gray-200 font-medium text-gray-600">From</th>
                <th className="text-left px-2 py-1.5 border-b border-gray-200 font-medium text-gray-600">Symbol</th>
                <th className="text-left px-2 py-1.5 border-b border-gray-200 font-medium text-gray-600">To</th>
                <th className="w-10 border-b border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {nfa.transitions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1.5 border-b border-gray-100">
                    <select
                      value={t.source}
                      onChange={e => updateTransition(t.id, { source: e.target.value })}
                      className="w-full bg-transparent border-none text-sm focus:outline-none"
                    >
                      {nfa.states.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 border-b border-gray-100">
                    <input
                      type="text"
                      value={t.symbol}
                      onChange={e => updateTransition(t.id, { symbol: e.target.value })}
                      className="w-full bg-transparent border-none text-sm font-mono focus:outline-none"
                    />
                  </td>
                  <td className="px-2 py-1.5 border-b border-gray-100">
                    <select
                      value={t.target}
                      onChange={e => updateTransition(t.id, { target: e.target.value })}
                      className="w-full bg-transparent border-none text-sm focus:outline-none"
                    >
                      {nfa.states.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 border-b border-gray-100 text-center">
                    <button
                      onClick={() => removeTransition(t.id)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      title="Remove transition"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No transitions yet.</p>
      )}

      {/* Add new transition */}
      {nfa.states.length >= 2 && (
        <div className="flex gap-1.5 items-end">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-0.5">From</label>
            <select
              value={newSource}
              onChange={e => setNewSource(e.target.value)}
              className="w-full border border-gray-300 rounded px-1.5 py-1 text-sm"
            >
              <option value="">--</option>
              {nfa.states.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-0.5">Symbol</label>
            <input
              type="text"
              value={newSymbol}
              onChange={e => setNewSymbol(e.target.value)}
              placeholder="a, b, ε"
              className="w-full border border-gray-300 rounded px-1.5 py-1 text-sm font-mono"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-0.5">To</label>
            <select
              value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
              className="w-full border border-gray-300 rounded px-1.5 py-1 text-sm"
            >
              <option value="">--</option>
              {nfa.states.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!newSource || !newTarget || !newSymbol}
            className="px-2 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
