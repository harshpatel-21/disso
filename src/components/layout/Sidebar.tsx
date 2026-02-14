import { useNFA } from '../../hooks/useNFA'
import { NFAInputPanel } from '../nfa-input/NFAInputPanel'
import { ConversionPanel } from '../conversion/ConversionPanel'
import { RegexToNFAPanel } from '../conversion/RegexToNFAPanel'

export function Sidebar() {
  const { appMode, nfaToRegexPhase } = useNFA()

  return (
    <aside className="w-[400px] shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      {appMode === 'nfa-to-regex' && nfaToRegexPhase === 'input' && (
        <NFAInputPanel />
      )}
      {appMode === 'nfa-to-regex' && nfaToRegexPhase === 'converting' && (
        <ConversionPanel />
      )}
      {appMode === 'regex-to-nfa' && <RegexToNFAPanel />}
    </aside>
  )
}
