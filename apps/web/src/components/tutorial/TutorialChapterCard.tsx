import { useState } from 'react';
import type { TutorialChapter, ChapterProgress, TutorialProgress } from '@circuit-crafter/shared';
import { TutorialLevelCard } from './TutorialLevelCard';
import { useTutorialStore } from '../../stores/tutorialStore';

interface TutorialChapterCardProps {
  chapter: TutorialChapter;
  chapterProgress: ChapterProgress;
  levelProgress: Record<string, TutorialProgress>;
  onSelectLevel: (levelId: string) => void;
}

const CHAPTER_COLORS: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  green: {
    bg: 'bg-green-900/20',
    border: 'border-green-700',
    text: 'text-green-400',
    gradient: 'from-green-600 to-green-500',
  },
  blue: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-700',
    text: 'text-blue-400',
    gradient: 'from-blue-600 to-blue-500',
  },
  yellow: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-700',
    text: 'text-yellow-400',
    gradient: 'from-yellow-600 to-yellow-500',
  },
  purple: {
    bg: 'bg-purple-900/20',
    border: 'border-purple-700',
    text: 'text-purple-400',
    gradient: 'from-purple-600 to-purple-500',
  },
  cyan: {
    bg: 'bg-cyan-900/20',
    border: 'border-cyan-700',
    text: 'text-cyan-400',
    gradient: 'from-cyan-600 to-cyan-500',
  },
  red: {
    bg: 'bg-red-900/20',
    border: 'border-red-700',
    text: 'text-red-400',
    gradient: 'from-red-600 to-red-500',
  },
};

const CHAPTER_ICONS: Record<string, JSX.Element> = {
  zap: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  ),
  calculator: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  ),
  lightbulb: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  ),
  'git-branch': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7a4 4 0 104-4M8 7V3m0 4v10m0 0a4 4 0 104 4m-4-4v-4m4 4V7a4 4 0 00-4-4"
    />
  ),
  cpu: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  ),
  rocket: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"
    />
  ),
};

export function TutorialChapterCard({
  chapter,
  chapterProgress,
  levelProgress,
  onSelectLevel,
}: TutorialChapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(chapterProgress.unlocked && !chapterProgress.completedAt);
  const { isLevelUnlocked } = useTutorialStore();

  const colors = CHAPTER_COLORS[chapter.color] ?? CHAPTER_COLORS.blue;
  const completionPercent = chapterProgress.totalLevels > 0
    ? (chapterProgress.levelsCompleted / chapterProgress.totalLevels) * 100
    : 0;
  const isComplete = chapterProgress.completedAt !== undefined;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
        chapterProgress.unlocked
          ? `${colors.bg} ${colors.border}`
          : 'bg-gray-800/30 border-gray-700 opacity-60'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => chapterProgress.unlocked && setIsExpanded(!isExpanded)}
        disabled={!chapterProgress.unlocked}
        className={`w-full p-4 flex items-center gap-3 text-left ${
          chapterProgress.unlocked ? 'cursor-pointer hover:bg-white/5' : 'cursor-not-allowed'
        }`}
      >
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            chapterProgress.unlocked
              ? `bg-gradient-to-br ${colors.gradient}`
              : 'bg-gray-700'
          }`}
        >
          <svg
            className={`w-5 h-5 ${chapterProgress.unlocked ? 'text-white' : 'text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {CHAPTER_ICONS[chapter.icon] ?? CHAPTER_ICONS.zap}
          </svg>
        </div>

        {/* Title and progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-semibold truncate ${
                chapterProgress.unlocked ? 'text-white' : 'text-gray-500'
              }`}
            >
              {chapter.title}
            </h3>
            {isComplete && (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                Complete
              </span>
            )}
            {!chapterProgress.unlocked && (
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            )}
          </div>
          <p className={`text-sm truncate ${chapterProgress.unlocked ? 'text-gray-400' : 'text-gray-600'}`}>
            {chapterProgress.levelsCompleted}/{chapterProgress.totalLevels} levels
          </p>
        </div>

        {/* Progress circle or expand arrow */}
        {chapterProgress.unlocked && (
          <div className="flex items-center gap-2">
            {/* Progress ring */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-gray-700"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${completionPercent} 100`}
                  className={colors.text}
                  style={{ strokeDasharray: `${completionPercent * 1.005} 100` }}
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${colors.text}`}>
                {Math.round(completionPercent)}%
              </span>
            </div>

            {/* Expand arrow */}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </button>

      {/* Expanded levels list */}
      {isExpanded && chapterProgress.unlocked && (
        <div className="px-4 pb-4 space-y-2">
          {chapter.levels.map((level) => (
            <TutorialLevelCard
              key={level.id}
              level={level}
              progress={levelProgress[level.id]}
              isUnlocked={isLevelUnlocked(level.id)}
              onSelect={onSelectLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
