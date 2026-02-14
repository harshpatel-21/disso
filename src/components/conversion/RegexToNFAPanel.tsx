export function RegexToNFAPanel() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <span className="text-2xl">🔄</span>
      </div>
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        Regex → NFA
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Convert regular expressions to NFAs using Thompson's construction.
      </p>
      <div className="w-full">
        <input
          type="text"
          placeholder="Enter a regular expression..."
          disabled
          className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400"
        />
      </div>
      <span className="mt-3 inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
        Coming Soon
      </span>
    </div>
  )
}
