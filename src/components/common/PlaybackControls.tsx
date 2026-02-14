import { useConversion } from '../../hooks/useConversion';

export function PlaybackControls() {
  const { conversion, hasNextStep, hasPrevStep, nextStep, prevStep, goToStep, reset } = useConversion();

  return (
    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <button
        onClick={reset}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 text-sm"
        title="Reset"
      >
        ⏮
      </button>
      <button
        onClick={prevStep}
        disabled={!hasPrevStep}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 text-sm"
        title="Previous step"
      >
        ◀
      </button>
      <span className="text-xs text-gray-500 min-w-[60px] text-center font-mono">
        {conversion.currentStepIndex + 1} / {conversion.steps.length}
      </span>
      <button
        onClick={nextStep}
        disabled={!hasNextStep}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 text-sm"
        title="Next step"
      >
        ▶
      </button>
      <button
        onClick={() => goToStep(conversion.steps.length - 1)}
        disabled={conversion.currentStepIndex >= conversion.steps.length - 1}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 text-sm"
        title="Skip to end"
      >
        ⏭
      </button>
    </div>
  );
}
