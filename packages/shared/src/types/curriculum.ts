/**
 * Curriculum Types for Educational Alignment
 *
 * Aligned with international standards:
 * - US: NGSS (Next Generation Science Standards)
 * - UK: National Curriculum KS2/KS3
 * - Common Core connections where applicable
 */

// Grade level ranges matching school systems
export type GradeLevel =
  | 'K-2'      // Kindergarten - Grade 2 (ages 5-7)
  | '3-5'      // Grade 3-5 (ages 8-10) - Upper Elementary
  | '6-8'      // Grade 6-8 (ages 11-13) - Middle School
  | '9-12';    // Grade 9-12 (ages 14-18) - High School

// UK Key Stage equivalents
export type KeyStage = 'KS1' | 'KS2' | 'KS3' | 'KS4';

// Curriculum standards this content aligns with
export type CurriculumStandard =
  | 'NGSS-PS2'      // Physical Science: Motion and Stability
  | 'NGSS-PS3'      // Physical Science: Energy
  | 'NGSS-ETS1'     // Engineering Design
  | 'NGSS-MS-PS2'   // Middle School Physical Science
  | 'NGSS-HS-PS2'   // High School Physical Science
  | 'UK-KS2-SCI'    // UK KS2 Science
  | 'UK-KS3-PHY'    // UK KS3 Physics
  | 'UK-KS4-PHY'    // UK KS4 Physics (GCSE level)
  | 'COMMON-CORE-MATH'; // Math connections

// Subject areas covered
export type SubjectArea =
  | 'physics'
  | 'engineering'
  | 'mathematics'
  | 'technology';

// Difficulty levels for adaptive learning
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Learning path structure
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradeLevel: GradeLevel;
  keyStage?: KeyStage;
  estimatedMinutes: number;
  subjects: SubjectArea[];
  standards: CurriculumStandard[];
  prerequisites?: string[];
  modules: LearningModule[];
  certificateId?: string;
}

export interface LearningModule {
  id: string;
  pathId: string;
  order: number;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  learningObjectives: string[];
  vocabulary: VocabularyTerm[];
  activities: LearningActivity[];
  assessment?: ModuleAssessment;
  standardsAddressed: CurriculumStandard[];
}

export interface VocabularyTerm {
  term: string;
  definition: string;
  gradeAppropriate: GradeLevel[];
}

export interface LearningActivity {
  id: string;
  type: 'tutorial' | 'challenge' | 'sandbox' | 'quiz';
  title: string;
  description: string;
  tutorialLevelId?: string;  // Link to existing tutorial levels
  challengeConfig?: ActivityChallenge;
  xpReward: number;
  requiredForProgress: boolean;
}

export interface ActivityChallenge {
  targetDescription: string;
  hints: string[];
  successCriteria: string[];
}

export interface ModuleAssessment {
  type: 'quiz' | 'project' | 'peer-review';
  questions?: AssessmentQuestion[];
  projectPrompt?: string;
  passingScore: number;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

// Progress tracking
export interface LearningPathProgress {
  pathId: string;
  userId?: string;
  startedAt: string;
  lastActivityAt: string;
  completedModules: string[];
  currentModuleId: string;
  totalTimeMinutes: number;
  assessmentScores: Record<string, number>;
  certificateEarned: boolean;
  certificateEarnedAt?: string;
}

export interface ModuleProgress {
  moduleId: string;
  pathId: string;
  startedAt: string;
  completedAt?: string;
  activitiesCompleted: string[];
  timeSpentMinutes: number;
  assessmentScore?: number;
  attempts: number;
}

// Certificates
export interface Certificate {
  id: string;
  pathId: string;
  title: string;
  description: string;
  badgeIcon: string;
  badgeColor: string;
  skills: string[];
  level: DifficultyLevel;
  issueDate?: string;
  studentName?: string;
}

// Skills tracking
export interface Skill {
  id: string;
  name: string;
  category: SubjectArea;
  description: string;
  gradeLevel: GradeLevel;
  masteryLevel: number;  // 0-100
  relatedConcepts: string[];
}

export interface SkillProgress {
  skillId: string;
  masteryLevel: number;
  practiceCount: number;
  lastPracticed: string;
  assessmentsPassed: number;
}

// Parent/Teacher dashboard data
export interface StudentProgress {
  studentId: string;
  studentName: string;
  gradeLevel: GradeLevel;
  totalXP: number;
  currentLevel: number;
  pathsStarted: number;
  pathsCompleted: number;
  certificatesEarned: string[];
  skillsMastered: string[];
  weeklyTimeMinutes: number;
  streakDays: number;
  recentAchievements: string[];
}

// Grade level metadata
export interface GradeLevelInfo {
  level: GradeLevel;
  ageRange: string;
  ukEquivalent: KeyStage;
  description: string;
  recommendedPaths: string[];
  keySkills: string[];
}

export const GRADE_LEVEL_INFO: Record<GradeLevel, GradeLevelInfo> = {
  'K-2': {
    level: 'K-2',
    ageRange: '5-7 years',
    ukEquivalent: 'KS1',
    description: 'Introduction to basic concepts through play and exploration',
    recommendedPaths: ['circuits-explorers'],
    keySkills: ['Basic circuit concepts', 'On/Off states', 'Simple connections'],
  },
  '3-5': {
    level: '3-5',
    ageRange: '8-10 years',
    ukEquivalent: 'KS2',
    description: 'Building foundational knowledge of electricity and circuits',
    recommendedPaths: ['circuits-explorers', 'electricity-basics'],
    keySkills: ['Complete circuits', 'Series connections', 'Conductors & insulators'],
  },
  '6-8': {
    level: '6-8',
    ageRange: '11-13 years',
    ukEquivalent: 'KS3',
    description: 'Applying scientific principles to circuit design',
    recommendedPaths: ['electricity-basics', 'ohms-law-mastery', 'digital-logic-intro'],
    keySkills: ['Ohm\'s Law', 'Series & Parallel circuits', 'Current & Voltage'],
  },
  '9-12': {
    level: '9-12',
    ageRange: '14-18 years',
    ukEquivalent: 'KS4',
    description: 'Advanced circuit analysis and engineering principles',
    recommendedPaths: ['ohms-law-mastery', 'digital-logic-intro', 'electronics-engineering'],
    keySkills: ['Circuit analysis', 'Transistors', 'Logic gates', 'Signal processing'],
  },
};
