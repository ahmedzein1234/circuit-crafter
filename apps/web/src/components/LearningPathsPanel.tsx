/**
 * Learning Paths Panel
 *
 * Displays curriculum-aligned learning paths for students
 * with grade-level filtering and progress tracking
 */

import { useState } from 'react';
import { useLearningPathStore } from '../stores/learningPathStore';
import { useTutorialStore } from '../stores/tutorialStore';
import {
  LEARNING_PATHS,
  getCertificateForPath,
  GRADE_LEVEL_INFO,
} from '@circuit-crafter/shared';
import type { GradeLevel, LearningPath, LearningModule } from '@circuit-crafter/shared';

interface LearningPathsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADE_COLORS: Record<GradeLevel, string> = {
  'K-2': 'from-green-500 to-emerald-600',
  '3-5': 'from-yellow-500 to-orange-500',
  '6-8': 'from-blue-500 to-indigo-600',
  '9-12': 'from-purple-500 to-pink-600',
};

const GRADE_BADGES: Record<GradeLevel, string> = {
  'K-2': 'bg-green-500/20 text-green-400 border-green-500/30',
  '3-5': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '6-8': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  '9-12': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export function LearningPathsPanel({ isOpen, onClose }: LearningPathsPanelProps) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | 'all'>('all');
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);

  const {
    studentName,
    gradeLevel,
    setStudentInfo,
    startPath,
    getPathProgress,
    getPathCompletionPercent,
    earnedCertificates,
    totalLearningMinutes,
  } = useLearningPathStore();

  const { startLevel } = useTutorialStore();

  if (!isOpen) return null;

  // Filter paths by grade
  const filteredPaths = selectedGrade === 'all'
    ? LEARNING_PATHS
    : LEARNING_PATHS.filter((p) => p.gradeLevel === selectedGrade);

  // Handle starting a path
  const handleStartPath = (path: LearningPath) => {
    if (!studentName) {
      setShowSetupModal(true);
      return;
    }

    startPath(path.id);
    const firstActivity = path.modules[0]?.activities[0];
    if (firstActivity?.tutorialLevelId) {
      startLevel(firstActivity.tutorialLevelId);
      onClose();
    }
  };

  // Handle continuing a path
  const handleContinuePath = (path: LearningPath) => {
    const progress = getPathProgress(path.id);
    if (!progress) return;

    const currentModule = path.modules.find((m) => m.id === progress.currentModuleId);
    if (currentModule) {
      const nextActivity = currentModule.activities.find(
        (a: { tutorialLevelId?: string }) => a.tutorialLevelId
      );
      if (nextActivity?.tutorialLevelId) {
        startLevel(nextActivity.tutorialLevelId);
        onClose();
      }
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (selectedPath) {
        setSelectedPath(null);
      } else {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden mx-4 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Learning Paths</h2>
                <p className="text-blue-100 text-sm">Curriculum-aligned lessons for all grade levels</p>
              </div>
            </div>
            <button
              onClick={selectedPath ? () => setSelectedPath(null) : onClose}
              className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Student Info Bar */}
          {studentName && (
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="bg-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span>👨‍🎓</span>
                <span className="text-white font-medium">{studentName}</span>
              </div>
              <div className="bg-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span>📊</span>
                <span className="text-white">{GRADE_LEVEL_INFO[gradeLevel].ageRange}</span>
              </div>
              <div className="bg-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span>⏱️</span>
                <span className="text-white">{Math.round(totalLearningMinutes)} min learned</span>
              </div>
              <div className="bg-white/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span>🏆</span>
                <span className="text-white">{earnedCertificates.length} certificates</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {selectedPath ? (
          <PathDetail
            path={selectedPath}
            progress={getPathProgress(selectedPath.id)}
            onBack={() => setSelectedPath(null)}
            onStart={() => handleStartPath(selectedPath)}
            onContinue={() => handleContinuePath(selectedPath)}
          />
        ) : (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Grade Filter */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-gray-400 text-sm mr-2">Filter by grade:</span>
              <button
                onClick={() => setSelectedGrade('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedGrade === 'all'
                    ? 'bg-white text-gray-900'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Grades
              </button>
              {(['K-2', '3-5', '6-8', '9-12'] as GradeLevel[]).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGrade === grade
                      ? `bg-gradient-to-r ${GRADE_COLORS[grade]} text-white`
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {grade} ({GRADE_LEVEL_INFO[grade].ageRange})
                </button>
              ))}
            </div>

            {/* Paths Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPaths.map((path) => {
                const progress = getPathProgress(path.id);
                const completion = getPathCompletionPercent(path.id);
                const certificate = getCertificateForPath(path.id);
                const isCompleted = progress?.certificateEarned;

                return (
                  <div
                    key={path.id}
                    onClick={() => setSelectedPath(path)}
                    className={`bg-gray-800 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border ${
                      isCompleted ? 'border-green-500/50' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${GRADE_COLORS[path.gradeLevel]} flex items-center justify-center text-2xl`}>
                        {path.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{path.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${GRADE_BADGES[path.gradeLevel]}`}>
                            {path.gradeLevel}
                          </span>
                          <span className="text-xs text-gray-500">
                            {path.estimatedMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{path.description}</p>

                    {/* Progress Bar */}
                    {progress && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-400">{completion}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${GRADE_COLORS[path.gradeLevel]} transition-all`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Standards */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {path.standards.slice(0, 2).map((std) => (
                        <span key={std} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                          {std}
                        </span>
                      ))}
                      {path.standards.length > 2 && (
                        <span className="text-xs text-gray-500">+{path.standards.length - 2} more</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <span>📖</span>
                        <span>{path.modules.length} modules</span>
                      </div>
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                          <span>✓</span>
                          <span>Completed</span>
                        </div>
                      ) : progress ? (
                        <button className="text-blue-400 text-sm font-medium hover:text-blue-300">
                          Continue →
                        </button>
                      ) : (
                        <button className="text-gray-400 text-sm font-medium hover:text-white">
                          Start →
                        </button>
                      )}
                    </div>

                    {/* Certificate Badge */}
                    {isCompleted && certificate && (
                      <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2">
                        <span className="text-lg">{certificate.badgeIcon}</span>
                        <span className="text-green-400 text-sm font-medium">{certificate.title}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredPaths.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📭</span>
                <p className="text-gray-400">No learning paths found for this grade level.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Setup Modal */}
      {showSetupModal && (
        <StudentSetupModal
          onClose={() => setShowSetupModal(false)}
          onSave={(name, grade) => {
            setStudentInfo(name, grade);
            setShowSetupModal(false);
          }}
        />
      )}
    </div>
  );
}

// Path Detail View
function PathDetail({
  path,
  progress,
  onBack,
  onStart,
  onContinue,
}: {
  path: LearningPath;
  progress?: ReturnType<typeof useLearningPathStore.getState>['getPathProgress'] extends (id: string) => infer R ? R : never;
  onBack: () => void;
  onStart: () => void;
  onContinue: () => void;
}) {
  const certificate = getCertificateForPath(path.id);
  const isStarted = !!progress;
  const isCompleted = progress?.certificateEarned;

  return (
    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to all paths
      </button>

      {/* Path Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${GRADE_COLORS[path.gradeLevel]} flex items-center justify-center text-3xl`}>
          {path.icon}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">{path.title}</h2>
          <p className="text-gray-400 mb-2">{path.description}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm px-3 py-1 rounded-full border ${GRADE_BADGES[path.gradeLevel]}`}>
              Grade {path.gradeLevel}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <span>⏱️</span> {path.estimatedMinutes} minutes
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <span>📖</span> {path.modules.length} modules
            </span>
          </div>
        </div>
        <div>
          {isCompleted ? (
            <div className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2">
              <span>✓</span> Completed
            </div>
          ) : isStarted ? (
            <button
              onClick={onContinue}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Continue Learning
            </button>
          ) : (
            <button
              onClick={onStart}
              className={`px-6 py-2 bg-gradient-to-r ${GRADE_COLORS[path.gradeLevel]} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
            >
              Start Path
            </button>
          )}
        </div>
      </div>

      {/* Curriculum Standards */}
      <div className="bg-gray-800 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <span>📋</span> Curriculum Standards Covered
        </h3>
        <div className="flex flex-wrap gap-2">
          {path.standards.map((std) => (
            <span key={std} className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
              {std}
            </span>
          ))}
        </div>
      </div>

      {/* Certificate Preview */}
      {certificate && (
        <div className={`bg-gradient-to-r ${isCompleted ? 'from-green-900/30 to-emerald-900/30 border-green-500/30' : 'from-gray-800 to-gray-800 border-gray-700'} border rounded-xl p-4 mb-6`}>
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <span className="text-xl">{certificate.badgeIcon}</span>
            Certificate: {certificate.title}
          </h3>
          <p className="text-gray-400 text-sm mb-3">{certificate.description}</p>
          <div className="flex flex-wrap gap-2">
            {certificate.skills.map((skill) => (
              <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Modules */}
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <span>📚</span> Learning Modules
      </h3>
      <div className="space-y-3">
        {path.modules.map((module, index) => {
          const isModuleCompleted = progress?.completedModules.includes(module.id);
          const isCurrentModule = progress?.currentModuleId === module.id;

          return (
            <ModuleCard
              key={module.id}
              module={module}
              index={index}
              isCompleted={isModuleCompleted || false}
              isCurrent={isCurrentModule || false}
              isLocked={!isStarted && index > 0}
            />
          );
        })}
      </div>
    </div>
  );
}

// Module Card
function ModuleCard({
  module,
  index,
  isCompleted,
  isCurrent,
  isLocked,
}: {
  module: LearningModule;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(isCurrent);

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        isCompleted
          ? 'bg-green-900/20 border-green-500/30'
          : isCurrent
          ? 'bg-blue-900/20 border-blue-500/30'
          : isLocked
          ? 'bg-gray-800/50 border-gray-700 opacity-60'
          : 'bg-gray-800 border-gray-700'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3"
        disabled={isLocked}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          isCompleted
            ? 'bg-green-600 text-white'
            : isCurrent
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-400'
        }`}>
          {isCompleted ? '✓' : index + 1}
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-medium text-white">{module.title}</h4>
          <p className="text-sm text-gray-400">{module.estimatedMinutes} min</p>
        </div>
        <div className="flex items-center gap-2">
          {isCurrent && (
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Current</span>
          )}
          {isLocked && (
            <span className="text-gray-500">🔒</span>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700/50">
          <p className="text-gray-400 text-sm mt-3 mb-4">{module.description}</p>

          {/* Learning Objectives */}
          <div className="mb-4">
            <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Learning Objectives</h5>
            <ul className="space-y-1">
              {module.learningObjectives.map((obj, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Vocabulary */}
          {module.vocabulary.length > 0 && (
            <div className="mb-4">
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Key Vocabulary</h5>
              <div className="flex flex-wrap gap-2">
                {module.vocabulary.map((term) => (
                  <span
                    key={term.term}
                    className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    title={term.definition}
                  >
                    {term.term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Activities */}
          <div>
            <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Activities</h5>
            <div className="space-y-2">
              {module.activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">
                    {activity.type === 'tutorial' && '📖'}
                    {activity.type === 'challenge' && '🎯'}
                    {activity.type === 'sandbox' && '🔧'}
                    {activity.type === 'quiz' && '📝'}
                  </span>
                  <span className="text-gray-300 flex-1">{activity.title}</span>
                  <span className="text-yellow-400 text-xs">+{activity.xpReward} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Student Setup Modal
function StudentSetupModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (name: string, grade: GradeLevel) => void;
}) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('3-5');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4">Student Profile</h3>
        <p className="text-gray-400 mb-6">Set up your profile to start learning!</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grade Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['K-2', '3-5', '6-8', '9-12'] as GradeLevel[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className={`p-3 rounded-lg border transition-all ${
                    grade === g
                      ? `bg-gradient-to-r ${GRADE_COLORS[g]} border-transparent text-white`
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium">{g}</div>
                  <div className="text-xs opacity-80">{GRADE_LEVEL_INFO[g].ageRange}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => name && onSave(name, grade)}
            disabled={!name}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
