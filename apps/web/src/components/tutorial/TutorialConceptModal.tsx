import { useTutorialStore } from '../../stores/tutorialStore';

export function TutorialConceptModal() {
  const { showConceptModal, closeConceptModal, getActiveLevel } = useTutorialStore();
  const level = getActiveLevel();

  if (!showConceptModal || !level) return null;

  const concept = level.educationalConcept;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header with gradient */}
        <div className="p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <span className="text-xs text-blue-400 font-medium uppercase tracking-wide">
                Learn First
              </span>
              <h2 className="text-xl font-bold text-white">{concept.title}</h2>
            </div>
          </div>
          <h3 className="text-lg text-gray-300">{level.title}</h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Main explanation */}
          <p className="text-gray-300 leading-relaxed">{concept.explanation}</p>

          {/* Formula if exists */}
          {concept.formula && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-semibold text-blue-400">Key Formula</span>
              </div>
              <div className="text-2xl font-mono text-white text-center py-2">
                {concept.formula}
              </div>
              {concept.formulaDescription && (
                <p className="text-sm text-blue-300 text-center mt-2">
                  {concept.formulaDescription}
                </p>
              )}
            </div>
          )}

          {/* Key Terms */}
          {concept.keyTerms.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Key Terms
              </h4>
              <div className="space-y-2">
                {concept.keyTerms.map((term, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                  >
                    <span className="font-semibold text-white">{term.term}</span>
                    <span className="text-gray-400"> - {term.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Components */}
          {concept.relatedComponents.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Components You'll Use
              </h4>
              <div className="flex flex-wrap gap-2">
                {concept.relatedComponents.map((comp) => (
                  <span
                    key={comp}
                    className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700"
                  >
                    {comp.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Objectives preview */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Your Objectives
            </h4>
            <div className="space-y-2">
              {level.objectives.filter(o => o.required).map((objective) => (
                <div key={objective.id} className="flex items-start gap-2">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">
                    {objective.order}
                  </div>
                  <span className="text-gray-300">{objective.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
              <span>{level.xpReward} XP</span>
              {level.timeBonusThresholdSeconds && (
                <>
                  <span className="text-gray-600">|</span>
                  <span>Bonus: under {Math.floor(level.timeBonusThresholdSeconds / 60)}min</span>
                </>
              )}
            </div>
            <button
              onClick={closeConceptModal}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              Start Level
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
