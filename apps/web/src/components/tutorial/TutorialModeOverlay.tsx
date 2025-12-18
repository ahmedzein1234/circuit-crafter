import { useState, useEffect } from 'react';
import { useTutorialStore, validateObjectives } from '../../stores/tutorialStore';
import { useCircuitStore } from '../../stores/circuitStore';
import type { TutorialHint } from '@circuit-crafter/shared';

export function TutorialModeOverlay() {
  const {
    isInTutorialMode,
    getActiveLevel,
    objectiveProgress,
    setObjectiveProgress,
    requestHint,
    getNextHint,
    hintRequestCount,
    sessionStartTime,
    exitTutorialMode,
    resetLevel,
    completeLevel,
    openConceptModal,
  } = useTutorialStore();

  const { components, wires, simulationResult, clearCircuit, loadCircuit } = useCircuitStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showHintPanel, setShowHintPanel] = useState(false);
  const [currentHint, setCurrentHint] = useState<TutorialHint | null>(null);

  const level = getActiveLevel();
  const nextHint = getNextHint();

  // Timer
  useEffect(() => {
    if (!isInTutorialMode || !sessionStartTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isInTutorialMode, sessionStartTime]);

  // Validate objectives when circuit changes
  useEffect(() => {
    if (!isInTutorialMode || !level) return;

    const results = validateObjectives(
      level,
      components.map((c) => ({
        type: c.type,
        id: c.id,
        properties: c.properties,
      })),
      wires.map((w) => ({ id: w.id })),
      simulationResult
    );

    const newProgress: Record<string, boolean> = {};
    let allRequiredComplete = true;

    results.forEach((result) => {
      newProgress[result.objectiveId] = result.completed;
      const objective = level.objectives.find((o) => o.id === result.objectiveId);
      if (objective?.required && !result.completed) {
        allRequiredComplete = false;
      }
    });

    setObjectiveProgress(newProgress);

    // Check if level is complete
    if (allRequiredComplete && simulationResult?.success) {
      // Calculate rating based on time and hints
      const rating = calculateRating(elapsedTime, hintRequestCount, level.timeBonusThresholdSeconds);
      completeLevel(rating, elapsedTime);
    }
  }, [isInTutorialMode, level, components, wires, simulationResult, setObjectiveProgress, completeLevel, elapsedTime, hintRequestCount]);

  const handleRequestHint = () => {
    const hint = requestHint();
    if (hint) {
      setCurrentHint(hint);
      setShowHintPanel(true);
    }
  };

  const handleReset = () => {
    const starterCircuit = resetLevel();
    if (starterCircuit) {
      loadCircuit(starterCircuit.components, starterCircuit.wires);
    } else {
      clearCircuit();
    }
  };

  const handleExit = () => {
    exitTutorialMode();
    clearCircuit();
  };

  if (!isInTutorialMode || !level) return null;

  const completedCount = level.objectives.filter(
    (o) => o.required && objectiveProgress[o.id]
  ).length;
  const totalRequired = level.objectives.filter((o) => o.required).length;
  const progressPercent = (completedCount / totalRequired) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Top bar with level info */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-3">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          {/* Level title */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExit}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Exit Tutorial"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div>
              <h2 className="font-semibold text-white">{level.title}</h2>
              <p className="text-xs text-gray-400">{level.description}</p>
            </div>
          </div>

          {/* Timer and progress */}
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              level.timeBonusThresholdSeconds && elapsedTime > level.timeBonusThresholdSeconds
                ? 'bg-red-900/30 text-red-400'
                : 'bg-gray-800 text-gray-300'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono">{formatTime(elapsedTime)}</span>
              {level.timeBonusThresholdSeconds && (
                <span className="text-xs text-gray-500">
                  / {formatTime(level.timeBonusThresholdSeconds)}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-gray-400">
                {completedCount}/{totalRequired}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={openConceptModal}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="Review Concept"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={handleReset}
                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 rounded-lg transition-colors"
                title="Reset Level"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Objectives panel (right side) */}
      <div className="fixed top-20 right-4 z-40 w-72 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-xl overflow-hidden">
        <div className="p-3 border-b border-gray-700 bg-gray-800/50">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Objectives
          </h3>
        </div>

        <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
          {level.objectives
            .filter((o) => o.required)
            .sort((a, b) => a.order - b.order)
            .map((objective) => {
              const isComplete = objectiveProgress[objective.id];
              return (
                <div
                  key={objective.id}
                  className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                    isComplete ? 'bg-green-900/20' : 'bg-gray-800/50'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isComplete ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs text-gray-400">{objective.order}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isComplete ? 'text-gray-400 line-through' : 'text-gray-300'
                    }`}
                  >
                    {objective.description}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Hint button */}
        <div className="p-3 border-t border-gray-700">
          {nextHint ? (
            <button
              onClick={handleRequestHint}
              className="w-full py-2 px-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Get Hint ({level.hints.length - hintRequestCount} left)
            </button>
          ) : hintRequestCount > 0 ? (
            <div className="text-center text-sm text-gray-500">
              All hints revealed
            </div>
          ) : null}
          {hintRequestCount > 0 && (
            <p className="text-xs text-yellow-600 mt-2 text-center">
              {hintRequestCount} hint(s) used (-{hintRequestCount * 10}% XP)
            </p>
          )}
        </div>
      </div>

      {/* Hint popup */}
      {showHintPanel && currentHint && (
        <div className="fixed bottom-4 right-4 z-50 w-80 bg-yellow-900/95 backdrop-blur-sm border border-yellow-700 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
          <div className="p-3 border-b border-yellow-700 bg-yellow-800/50 flex items-center justify-between">
            <h4 className="font-semibold text-yellow-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Hint #{currentHint.order}
            </h4>
            <button
              onClick={() => setShowHintPanel(false)}
              className="p-1 text-yellow-400 hover:text-yellow-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <p className="text-yellow-100">{currentHint.content}</p>
          </div>
        </div>
      )}
    </>
  );
}

function calculateRating(
  timeSeconds: number,
  hintsUsed: number,
  timeBonusThreshold?: number
): 'gold' | 'silver' | 'bronze' {
  if (timeBonusThreshold && timeSeconds <= timeBonusThreshold && hintsUsed === 0) {
    return 'gold';
  }
  if (hintsUsed <= 2) {
    return 'silver';
  }
  return 'bronze';
}
