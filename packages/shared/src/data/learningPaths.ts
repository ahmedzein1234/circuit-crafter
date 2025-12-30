/**
 * Learning Paths - Curriculum-Aligned Lessons for Schools
 *
 * Each path is designed to align with educational standards:
 * - US: NGSS (Next Generation Science Standards)
 * - UK: National Curriculum KS2/KS3/KS4
 *
 * Paths are organized by grade level and build progressively.
 */

import type {
  LearningPath,
  LearningModule,
  Certificate,
  Skill,
} from '../types/curriculum';

// ==================== Skills Database ====================

export const SKILLS: Skill[] = [
  // Basic Skills (K-2, 3-5)
  {
    id: 'skill-circuit-basics',
    name: 'Circuit Basics',
    category: 'physics',
    description: 'Understanding what makes a complete circuit',
    gradeLevel: 'K-2',
    masteryLevel: 0,
    relatedConcepts: ['current', 'voltage', 'complete-circuit'],
  },
  {
    id: 'skill-conductors-insulators',
    name: 'Conductors & Insulators',
    category: 'physics',
    description: 'Identifying materials that conduct electricity',
    gradeLevel: '3-5',
    masteryLevel: 0,
    relatedConcepts: ['materials', 'resistance', 'safety'],
  },
  {
    id: 'skill-switches',
    name: 'Switches & Control',
    category: 'physics',
    description: 'Using switches to control circuit flow',
    gradeLevel: '3-5',
    masteryLevel: 0,
    relatedConcepts: ['open-circuit', 'closed-circuit', 'control'],
  },

  // Intermediate Skills (6-8)
  {
    id: 'skill-ohms-law',
    name: "Ohm's Law",
    category: 'physics',
    description: 'Applying V = I × R to circuit analysis',
    gradeLevel: '6-8',
    masteryLevel: 0,
    relatedConcepts: ['voltage', 'current', 'resistance', 'formulas'],
  },
  {
    id: 'skill-series-parallel',
    name: 'Series & Parallel',
    category: 'physics',
    description: 'Analyzing series and parallel circuits',
    gradeLevel: '6-8',
    masteryLevel: 0,
    relatedConcepts: ['resistors', 'current-division', 'voltage-division'],
  },
  {
    id: 'skill-power-calculation',
    name: 'Power Calculation',
    category: 'physics',
    description: 'Calculating electrical power using P = V × I',
    gradeLevel: '6-8',
    masteryLevel: 0,
    relatedConcepts: ['watts', 'energy', 'efficiency'],
  },

  // Advanced Skills (9-12)
  {
    id: 'skill-logic-gates',
    name: 'Digital Logic',
    category: 'technology',
    description: 'Understanding AND, OR, NOT gates and truth tables',
    gradeLevel: '9-12',
    masteryLevel: 0,
    relatedConcepts: ['binary', 'boolean-algebra', 'digital-circuits'],
  },
  {
    id: 'skill-transistors',
    name: 'Transistors',
    category: 'engineering',
    description: 'Using transistors as switches and amplifiers',
    gradeLevel: '9-12',
    masteryLevel: 0,
    relatedConcepts: ['semiconductors', 'amplification', 'switching'],
  },
  {
    id: 'skill-capacitors',
    name: 'Capacitors & Timing',
    category: 'engineering',
    description: 'Understanding capacitor charging and RC circuits',
    gradeLevel: '9-12',
    masteryLevel: 0,
    relatedConcepts: ['energy-storage', 'time-constant', 'filtering'],
  },
];

// ==================== Certificates ====================

export const CERTIFICATES: Certificate[] = [
  {
    id: 'cert-circuit-explorer',
    pathId: 'circuits-explorers',
    title: 'Circuit Explorer',
    description: 'Completed introductory exploration of electrical circuits',
    badgeIcon: '🔌',
    badgeColor: 'green',
    skills: ['Basic circuit concepts', 'Simple connections', 'Switch operation'],
    level: 'beginner',
  },
  {
    id: 'cert-electricity-fundamentals',
    pathId: 'electricity-basics',
    title: 'Electricity Fundamentals',
    description: 'Demonstrated understanding of basic electricity principles',
    badgeIcon: '⚡',
    badgeColor: 'yellow',
    skills: ['Complete circuits', 'Series connections', 'LED circuits'],
    level: 'beginner',
  },
  {
    id: 'cert-ohms-law-master',
    pathId: 'ohms-law-mastery',
    title: "Ohm's Law Master",
    description: "Mastered Ohm's Law and circuit calculations",
    badgeIcon: '📐',
    badgeColor: 'blue',
    skills: ["Ohm's Law", 'Power calculation', 'Circuit analysis'],
    level: 'intermediate',
  },
  {
    id: 'cert-digital-logic',
    pathId: 'digital-logic-intro',
    title: 'Digital Logic Pioneer',
    description: 'Completed introduction to digital logic circuits',
    badgeIcon: '🖥️',
    badgeColor: 'purple',
    skills: ['Logic gates', 'Truth tables', 'Binary logic'],
    level: 'intermediate',
  },
  {
    id: 'cert-electronics-engineer',
    pathId: 'electronics-engineering',
    title: 'Junior Electronics Engineer',
    description: 'Demonstrated proficiency in advanced circuit design',
    badgeIcon: '🎓',
    badgeColor: 'gold',
    skills: ['Transistors', 'Capacitors', 'Complex circuits', 'Signal processing'],
    level: 'advanced',
  },
];

// ==================== Learning Paths ====================

export const LEARNING_PATHS: LearningPath[] = [
  // ==================== Path 1: Circuit Explorers (K-2) ====================
  {
    id: 'circuits-explorers',
    title: 'Circuit Explorers',
    description: 'Discover the exciting world of electricity! Learn how circuits work through fun, hands-on activities.',
    icon: '🔦',
    color: 'green',
    gradeLevel: 'K-2',
    keyStage: 'KS1',
    estimatedMinutes: 45,
    subjects: ['physics', 'technology'],
    standards: ['NGSS-PS3', 'UK-KS2-SCI'],
    certificateId: 'cert-circuit-explorer',
    modules: [
      {
        id: 'ce-module-1',
        pathId: 'circuits-explorers',
        order: 1,
        title: 'What is Electricity?',
        description: 'Learn about electricity and where it comes from',
        difficulty: 'beginner',
        estimatedMinutes: 15,
        learningObjectives: [
          'Understand that electricity is a form of energy',
          'Know that electricity needs a path to flow',
          'Recognize batteries as a source of electricity',
        ],
        vocabulary: [
          { term: 'Electricity', definition: 'A type of energy that powers things', gradeAppropriate: ['K-2', '3-5'] },
          { term: 'Battery', definition: 'A container that stores electricity', gradeAppropriate: ['K-2', '3-5'] },
          { term: 'Light up', definition: 'When something glows because electricity is flowing', gradeAppropriate: ['K-2'] },
        ],
        activities: [
          {
            id: 'ce-1-explore',
            type: 'sandbox',
            title: 'Meet the Battery',
            description: 'Drag a battery onto the canvas and explore what it does!',
            xpReward: 25,
            requiredForProgress: true,
          },
          {
            id: 'ce-1-first-circuit',
            type: 'tutorial',
            title: 'Your First Light',
            description: 'Connect a battery to an LED and watch it glow!',
            tutorialLevelId: 'basics_1',
            xpReward: 50,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-PS3', 'UK-KS2-SCI'],
      },
      {
        id: 'ce-module-2',
        pathId: 'circuits-explorers',
        order: 2,
        title: 'On and Off',
        description: 'Use switches to control your circuit like a light switch at home!',
        difficulty: 'beginner',
        estimatedMinutes: 15,
        learningObjectives: [
          'Understand that switches control the flow of electricity',
          'Know the difference between open and closed circuits',
          'Be able to add a switch to a circuit',
        ],
        vocabulary: [
          { term: 'Switch', definition: 'Something that turns electricity on or off', gradeAppropriate: ['K-2', '3-5'] },
          { term: 'Open', definition: 'When the switch is off and electricity cannot flow', gradeAppropriate: ['K-2', '3-5'] },
          { term: 'Closed', definition: 'When the switch is on and electricity can flow', gradeAppropriate: ['K-2', '3-5'] },
        ],
        activities: [
          {
            id: 'ce-2-switch',
            type: 'tutorial',
            title: 'Add a Switch',
            description: 'Add a switch to control when your LED lights up',
            tutorialLevelId: 'basics_2',
            xpReward: 60,
            requiredForProgress: true,
          },
          {
            id: 'ce-2-challenge',
            type: 'challenge',
            title: 'Flashlight Challenge',
            description: 'Build a circuit that works like a flashlight!',
            xpReward: 40,
            requiredForProgress: false,
            challengeConfig: {
              targetDescription: 'Create a circuit with a battery, switch, and LED',
              hints: ['Start with a battery', 'Add a switch in the middle', 'End with an LED'],
              successCriteria: ['LED lights when switch is closed', 'LED is off when switch is open'],
            },
          },
        ],
        standardsAddressed: ['NGSS-PS3', 'UK-KS2-SCI'],
      },
      {
        id: 'ce-module-3',
        pathId: 'circuits-explorers',
        order: 3,
        title: 'More Lights!',
        description: 'Light up multiple LEDs with one battery',
        difficulty: 'beginner',
        estimatedMinutes: 15,
        learningObjectives: [
          'Understand that one battery can power multiple components',
          'Practice connecting multiple LEDs',
          'Explore brightness differences',
        ],
        vocabulary: [
          { term: 'LED', definition: 'A small light that uses electricity', gradeAppropriate: ['K-2', '3-5'] },
          { term: 'Bright', definition: 'Giving off a lot of light', gradeAppropriate: ['K-2'] },
          { term: 'Dim', definition: 'Giving off only a little light', gradeAppropriate: ['K-2'] },
        ],
        activities: [
          {
            id: 'ce-3-two-leds',
            type: 'tutorial',
            title: 'Double the Fun',
            description: 'Power two LEDs with one battery!',
            tutorialLevelId: 'basics_4',
            xpReward: 75,
            requiredForProgress: true,
          },
        ],
        assessment: {
          type: 'quiz',
          questions: [
            {
              id: 'ce-q1',
              question: 'What do you need for electricity to flow?',
              type: 'multiple-choice',
              options: ['A complete path (circuit)', 'Just a battery', 'Only wires', 'Nothing special'],
              correctAnswer: 'A complete path (circuit)',
              explanation: 'Electricity needs a complete path to flow from the battery, through components, and back!',
              points: 10,
            },
            {
              id: 'ce-q2',
              question: 'What does a switch do?',
              type: 'multiple-choice',
              options: ['Controls when electricity flows', 'Makes more electricity', 'Changes colors', 'Nothing'],
              correctAnswer: 'Controls when electricity flows',
              explanation: 'A switch opens and closes the circuit to control when electricity can flow!',
              points: 10,
            },
          ],
          passingScore: 70,
        },
        standardsAddressed: ['NGSS-PS3', 'UK-KS2-SCI'],
      },
    ],
  },

  // ==================== Path 2: Electricity Basics (3-5) ====================
  {
    id: 'electricity-basics',
    title: 'Electricity Basics',
    description: 'Build on your knowledge! Learn how electricity flows, what makes circuits complete, and design your own working circuits.',
    icon: '💡',
    color: 'yellow',
    gradeLevel: '3-5',
    keyStage: 'KS2',
    estimatedMinutes: 90,
    subjects: ['physics', 'engineering'],
    standards: ['NGSS-PS2', 'NGSS-PS3', 'UK-KS2-SCI'],
    prerequisites: ['circuits-explorers'],
    certificateId: 'cert-electricity-fundamentals',
    modules: [
      {
        id: 'eb-module-1',
        pathId: 'electricity-basics',
        order: 1,
        title: 'Complete Circuits',
        description: 'Understand why circuits must be complete for electricity to flow',
        difficulty: 'beginner',
        estimatedMinutes: 20,
        learningObjectives: [
          'Explain why a circuit must be complete',
          'Identify breaks in a circuit',
          'Use ground connections properly',
        ],
        vocabulary: [
          { term: 'Complete circuit', definition: 'A path with no breaks where electricity can flow all the way around', gradeAppropriate: ['3-5', '6-8'] },
          { term: 'Ground', definition: 'The return path for electricity, like the negative side of a battery', gradeAppropriate: ['3-5', '6-8'] },
          { term: 'Current', definition: 'The flow of electricity through a wire', gradeAppropriate: ['3-5', '6-8'] },
        ],
        activities: [
          {
            id: 'eb-1-ground',
            type: 'tutorial',
            title: 'Understanding Ground',
            description: 'Learn about ground and why circuits need a return path',
            tutorialLevelId: 'basics_3',
            xpReward: 50,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-PS3', 'UK-KS2-SCI'],
      },
      {
        id: 'eb-module-2',
        pathId: 'electricity-basics',
        order: 2,
        title: 'Circuit Safety',
        description: 'Learn about fuses and how to protect circuits',
        difficulty: 'beginner',
        estimatedMinutes: 20,
        learningObjectives: [
          'Understand why circuits need protection',
          'Know what a fuse does',
          'Design a protected circuit',
        ],
        vocabulary: [
          { term: 'Fuse', definition: 'A safety device that breaks the circuit if too much current flows', gradeAppropriate: ['3-5', '6-8'] },
          { term: 'Overcurrent', definition: 'When too much electricity flows through a circuit', gradeAppropriate: ['3-5', '6-8'] },
          { term: 'Short circuit', definition: 'A dangerous path that lets too much current flow', gradeAppropriate: ['3-5', '6-8'] },
        ],
        activities: [
          {
            id: 'eb-2-fuse',
            type: 'tutorial',
            title: 'Circuit Protection',
            description: 'Add a fuse to protect your circuit from damage',
            tutorialLevelId: 'basics_5',
            xpReward: 80,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-ETS1', 'UK-KS2-SCI'],
      },
      {
        id: 'eb-module-3',
        pathId: 'electricity-basics',
        order: 3,
        title: 'LED Circuit Design',
        description: 'Design circuits with LEDs and understand why resistors are important',
        difficulty: 'intermediate',
        estimatedMinutes: 25,
        learningObjectives: [
          'Understand why LEDs need resistors',
          'Know what happens without a resistor (LED burns out)',
          'Calculate simple resistor values',
        ],
        vocabulary: [
          { term: 'Resistor', definition: 'A component that limits how much current can flow', gradeAppropriate: ['3-5', '6-8'] },
          { term: 'LED', definition: 'Light Emitting Diode - a type of light that only works one direction', gradeAppropriate: ['3-5', '6-8'] },
          { term: 'Brightness', definition: 'How much light an LED gives off, controlled by current', gradeAppropriate: ['3-5', '6-8'] },
        ],
        activities: [
          {
            id: 'eb-3-led-basics',
            type: 'tutorial',
            title: 'LED Fundamentals',
            description: 'Learn why LEDs need resistors',
            tutorialLevelId: 'led_circuits_1',
            xpReward: 75,
            requiredForProgress: true,
          },
          {
            id: 'eb-3-brightness',
            type: 'tutorial',
            title: 'Brightness Control',
            description: 'Control LED brightness with different resistors',
            tutorialLevelId: 'led_circuits_2',
            xpReward: 80,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-PS3', 'NGSS-ETS1'],
      },
      {
        id: 'eb-module-4',
        pathId: 'electricity-basics',
        order: 4,
        title: 'Series Circuits',
        description: 'Connect components in a row to create series circuits',
        difficulty: 'intermediate',
        estimatedMinutes: 25,
        learningObjectives: [
          'Understand series circuit configuration',
          'Know that current is the same through all components',
          'Build a working series LED circuit',
        ],
        vocabulary: [
          { term: 'Series circuit', definition: 'Components connected end-to-end in a single path', gradeAppropriate: ['3-5', '6-8'] },
          { term: 'Same current', definition: 'In series, electricity flows through each part equally', gradeAppropriate: ['3-5', '6-8'] },
        ],
        activities: [
          {
            id: 'eb-4-series-leds',
            type: 'tutorial',
            title: 'LEDs in Series',
            description: 'Connect multiple LEDs in series',
            tutorialLevelId: 'led_circuits_3',
            xpReward: 90,
            requiredForProgress: true,
          },
        ],
        assessment: {
          type: 'quiz',
          questions: [
            {
              id: 'eb-q1',
              question: 'Why do LEDs need resistors?',
              type: 'multiple-choice',
              options: ['To limit current and prevent burning out', 'To make them brighter', 'To change their color', 'They don\'t need them'],
              correctAnswer: 'To limit current and prevent burning out',
              explanation: 'Without a resistor, too much current flows through the LED and it burns out!',
              points: 15,
            },
            {
              id: 'eb-q2',
              question: 'In a series circuit, the current through each component is:',
              type: 'multiple-choice',
              options: ['The same', 'Different for each', 'Zero', 'Infinite'],
              correctAnswer: 'The same',
              explanation: 'In series, there\'s only one path, so the same current flows through everything!',
              points: 15,
            },
            {
              id: 'eb-q3',
              question: 'What does a fuse do when too much current flows?',
              type: 'multiple-choice',
              options: ['It breaks to stop the current', 'It makes more current', 'It stores electricity', 'Nothing'],
              correctAnswer: 'It breaks to stop the current',
              explanation: 'A fuse is a safety device that breaks (blows) to protect the circuit!',
              points: 10,
            },
          ],
          passingScore: 70,
        },
        standardsAddressed: ['NGSS-PS2', 'NGSS-PS3'],
      },
    ],
  },

  // ==================== Path 3: Ohm's Law Mastery (6-8) ====================
  {
    id: 'ohms-law-mastery',
    title: "Ohm's Law Mastery",
    description: "Master the fundamental law of electricity! Learn to calculate voltage, current, and resistance using V = I × R.",
    icon: '📊',
    color: 'blue',
    gradeLevel: '6-8',
    keyStage: 'KS3',
    estimatedMinutes: 120,
    subjects: ['physics', 'mathematics'],
    standards: ['NGSS-MS-PS2', 'UK-KS3-PHY', 'COMMON-CORE-MATH'],
    prerequisites: ['electricity-basics'],
    certificateId: 'cert-ohms-law-master',
    modules: [
      {
        id: 'olm-module-1',
        pathId: 'ohms-law-mastery',
        order: 1,
        title: 'The Magic Formula',
        description: "Discover V = I × R, the most important formula in electronics",
        difficulty: 'intermediate',
        estimatedMinutes: 25,
        learningObjectives: [
          'State Ohm\'s Law (V = I × R)',
          'Define voltage, current, and resistance',
          'Use the formula to calculate unknown values',
        ],
        vocabulary: [
          { term: 'Voltage (V)', definition: 'Electrical pressure that pushes current, measured in Volts', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Current (I)', definition: 'The rate of electron flow, measured in Amperes (A)', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Resistance (R)', definition: 'Opposition to current flow, measured in Ohms (Ω)', gradeAppropriate: ['6-8', '9-12'] },
        ],
        activities: [
          {
            id: 'olm-1-intro',
            type: 'tutorial',
            title: "Ohm's Law Introduction",
            description: "Learn the relationship between voltage, current, and resistance",
            tutorialLevelId: 'ohms_law_1',
            xpReward: 75,
            requiredForProgress: true,
          },
          {
            id: 'olm-1-resistance',
            type: 'tutorial',
            title: 'Changing Resistance',
            description: 'See how resistance affects current flow',
            tutorialLevelId: 'ohms_law_2',
            xpReward: 80,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-MS-PS2', 'UK-KS3-PHY'],
      },
      {
        id: 'olm-module-2',
        pathId: 'ohms-law-mastery',
        order: 2,
        title: 'Voltage Division',
        description: 'Understand how voltage divides across components',
        difficulty: 'intermediate',
        estimatedMinutes: 25,
        learningObjectives: [
          'Explain voltage division in series circuits',
          'Calculate voltage drops across resistors',
          'Apply Kirchhoff\'s Voltage Law',
        ],
        vocabulary: [
          { term: 'Voltage drop', definition: 'The decrease in voltage across a component', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Kirchhoff\'s Voltage Law', definition: 'The sum of voltages around a closed loop equals zero', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Voltage divider', definition: 'Two resistors that create a fraction of input voltage', gradeAppropriate: ['6-8', '9-12'] },
        ],
        activities: [
          {
            id: 'olm-2-voltage-div',
            type: 'tutorial',
            title: 'Voltage Division',
            description: 'See how voltage divides across resistors',
            tutorialLevelId: 'ohms_law_3',
            xpReward: 85,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-MS-PS2', 'COMMON-CORE-MATH'],
      },
      {
        id: 'olm-module-3',
        pathId: 'ohms-law-mastery',
        order: 3,
        title: 'Power Calculation',
        description: 'Calculate electrical power using P = V × I',
        difficulty: 'intermediate',
        estimatedMinutes: 25,
        learningObjectives: [
          'Calculate power using P = V × I',
          'Understand power dissipation in resistors',
          'Relate power to energy consumption',
        ],
        vocabulary: [
          { term: 'Power (P)', definition: 'Rate of energy use, measured in Watts (W)', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Watt', definition: 'Unit of power, equal to one Joule per second', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Dissipation', definition: 'Energy released as heat in a resistor', gradeAppropriate: ['6-8', '9-12'] },
        ],
        activities: [
          {
            id: 'olm-3-power',
            type: 'tutorial',
            title: 'Power Calculation',
            description: 'Calculate power using P = V × I',
            tutorialLevelId: 'ohms_law_4',
            xpReward: 90,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-MS-PS2', 'COMMON-CORE-MATH'],
      },
      {
        id: 'olm-module-4',
        pathId: 'ohms-law-mastery',
        order: 4,
        title: 'Series & Parallel Analysis',
        description: 'Analyze complex series and parallel circuits',
        difficulty: 'advanced',
        estimatedMinutes: 45,
        learningObjectives: [
          'Calculate equivalent resistance in series and parallel',
          'Analyze current division in parallel circuits',
          'Design circuits to meet specifications',
        ],
        vocabulary: [
          { term: 'Equivalent resistance', definition: 'A single resistance value that replaces a combination', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Parallel resistance', definition: '1/R_total = 1/R1 + 1/R2 + ...', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Current division', definition: 'Total current splits among parallel branches', gradeAppropriate: ['6-8', '9-12'] },
        ],
        activities: [
          {
            id: 'olm-4-series',
            type: 'tutorial',
            title: 'Resistors in Series',
            description: 'Calculate total resistance in series',
            tutorialLevelId: 'series_parallel_1',
            xpReward: 75,
            requiredForProgress: true,
          },
          {
            id: 'olm-4-parallel',
            type: 'tutorial',
            title: 'Resistors in Parallel',
            description: 'Calculate equivalent parallel resistance',
            tutorialLevelId: 'series_parallel_2',
            xpReward: 85,
            requiredForProgress: true,
          },
          {
            id: 'olm-4-divider',
            type: 'tutorial',
            title: 'Voltage Divider Circuit',
            description: 'Build a practical voltage divider',
            tutorialLevelId: 'series_parallel_3',
            xpReward: 90,
            requiredForProgress: true,
          },
          {
            id: 'olm-4-challenge',
            type: 'tutorial',
            title: "Ohm's Law Challenge",
            description: 'Design a circuit for specific current',
            tutorialLevelId: 'ohms_law_5',
            xpReward: 100,
            requiredForProgress: true,
          },
        ],
        assessment: {
          type: 'quiz',
          questions: [
            {
              id: 'olm-q1',
              question: 'If V = 12V and R = 4Ω, what is the current (I)?',
              type: 'multiple-choice',
              options: ['3A', '48A', '0.33A', '16A'],
              correctAnswer: '3A',
              explanation: 'Using I = V/R: I = 12V / 4Ω = 3A',
              points: 20,
            },
            {
              id: 'olm-q2',
              question: 'Two 100Ω resistors in parallel have an equivalent resistance of:',
              type: 'multiple-choice',
              options: ['50Ω', '200Ω', '100Ω', '25Ω'],
              correctAnswer: '50Ω',
              explanation: 'For equal resistors in parallel: R_eq = R/n = 100Ω/2 = 50Ω',
              points: 20,
            },
            {
              id: 'olm-q3',
              question: 'If a circuit uses 2A at 9V, how much power does it use?',
              type: 'multiple-choice',
              options: ['18W', '4.5W', '11W', '7W'],
              correctAnswer: '18W',
              explanation: 'P = V × I = 9V × 2A = 18W',
              points: 20,
            },
          ],
          passingScore: 70,
        },
        standardsAddressed: ['NGSS-MS-PS2', 'UK-KS3-PHY', 'COMMON-CORE-MATH'],
      },
    ],
  },

  // ==================== Path 4: Digital Logic Introduction (6-8 / 9-12) ====================
  {
    id: 'digital-logic-intro',
    title: 'Digital Logic Introduction',
    description: 'Enter the digital world! Learn about AND, OR, and NOT gates - the building blocks of computers.',
    icon: '🖥️',
    color: 'purple',
    gradeLevel: '6-8',
    keyStage: 'KS3',
    estimatedMinutes: 90,
    subjects: ['technology', 'mathematics'],
    standards: ['NGSS-ETS1', 'UK-KS3-PHY'],
    prerequisites: ['ohms-law-mastery'],
    certificateId: 'cert-digital-logic',
    modules: [
      {
        id: 'dli-module-1',
        pathId: 'digital-logic-intro',
        order: 1,
        title: 'Binary and Logic',
        description: 'Understand binary (1s and 0s) and basic logic concepts',
        difficulty: 'intermediate',
        estimatedMinutes: 20,
        learningObjectives: [
          'Explain binary representation (1 = HIGH, 0 = LOW)',
          'Understand Boolean logic basics',
          'Recognize logic gates symbols',
        ],
        vocabulary: [
          { term: 'Binary', definition: 'A number system using only 0 and 1', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'HIGH/LOW', definition: 'The two states: HIGH = 1 = ON, LOW = 0 = OFF', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Logic gate', definition: 'A component that performs a Boolean operation', gradeAppropriate: ['6-8', '9-12'] },
        ],
        activities: [
          {
            id: 'dli-1-and',
            type: 'tutorial',
            title: 'The AND Gate',
            description: 'Discover how AND gates work',
            tutorialLevelId: 'logic_gates_1',
            xpReward: 80,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-ETS1'],
      },
      {
        id: 'dli-module-2',
        pathId: 'digital-logic-intro',
        order: 2,
        title: 'OR and NOT Gates',
        description: 'Learn about OR and NOT (inverter) gates',
        difficulty: 'intermediate',
        estimatedMinutes: 25,
        learningObjectives: [
          'Build and test OR gate circuits',
          'Understand NOT gate (inversion)',
          'Create truth tables for each gate',
        ],
        vocabulary: [
          { term: 'OR gate', definition: 'Output is 1 if ANY input is 1', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'NOT gate', definition: 'Output is the opposite of the input (inverter)', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Truth table', definition: 'A table showing all input/output combinations', gradeAppropriate: ['6-8', '9-12'] },
        ],
        activities: [
          {
            id: 'dli-2-or',
            type: 'tutorial',
            title: 'The OR Gate',
            description: 'Learn how OR gates process inputs',
            tutorialLevelId: 'logic_gates_2',
            xpReward: 80,
            requiredForProgress: true,
          },
          {
            id: 'dli-2-not',
            type: 'tutorial',
            title: 'The NOT Gate',
            description: 'Explore signal inversion',
            tutorialLevelId: 'logic_gates_3',
            xpReward: 75,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-ETS1', 'UK-KS3-PHY'],
      },
      {
        id: 'dli-module-3',
        pathId: 'digital-logic-intro',
        order: 3,
        title: 'Combined Logic',
        description: 'Combine gates to create complex logic functions',
        difficulty: 'advanced',
        estimatedMinutes: 45,
        learningObjectives: [
          'Build NAND gates from AND and NOT',
          'Understand XOR logic',
          'Design logic circuits from requirements',
        ],
        vocabulary: [
          { term: 'NAND gate', definition: 'NOT-AND: output is LOW only when all inputs are HIGH', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'XOR gate', definition: 'Exclusive OR: output is HIGH when inputs differ', gradeAppropriate: ['6-8', '9-12'] },
          { term: 'Universal gate', definition: 'NAND and NOR can build any logic function', gradeAppropriate: ['9-12'] },
        ],
        activities: [
          {
            id: 'dli-3-nand',
            type: 'tutorial',
            title: 'Build a NAND Gate',
            description: 'Combine AND and NOT gates',
            tutorialLevelId: 'logic_gates_4',
            xpReward: 90,
            requiredForProgress: true,
          },
          {
            id: 'dli-3-xor',
            type: 'tutorial',
            title: 'XOR Challenge',
            description: 'Build the exclusive OR function',
            tutorialLevelId: 'logic_gates_5',
            xpReward: 120,
            requiredForProgress: true,
          },
        ],
        assessment: {
          type: 'quiz',
          questions: [
            {
              id: 'dli-q1',
              question: 'An AND gate with inputs A=1, B=0 outputs:',
              type: 'multiple-choice',
              options: ['0', '1', 'Depends on voltage', 'Error'],
              correctAnswer: '0',
              explanation: 'AND requires ALL inputs to be 1. With B=0, output is 0.',
              points: 15,
            },
            {
              id: 'dli-q2',
              question: 'An OR gate with inputs A=0, B=1 outputs:',
              type: 'multiple-choice',
              options: ['1', '0', 'Depends on voltage', 'Error'],
              correctAnswer: '1',
              explanation: 'OR outputs 1 if ANY input is 1. With B=1, output is 1.',
              points: 15,
            },
            {
              id: 'dli-q3',
              question: 'What does a NOT gate do?',
              type: 'multiple-choice',
              options: ['Inverts the input', 'Adds inputs', 'Multiplies inputs', 'Nothing'],
              correctAnswer: 'Inverts the input',
              explanation: 'NOT gate outputs the opposite: 0 becomes 1, 1 becomes 0.',
              points: 10,
            },
          ],
          passingScore: 70,
        },
        standardsAddressed: ['NGSS-ETS1', 'UK-KS3-PHY'],
      },
    ],
  },

  // ==================== Path 5: Electronics Engineering (9-12) ====================
  {
    id: 'electronics-engineering',
    title: 'Electronics Engineering',
    description: 'Advanced circuit design with transistors, capacitors, and complex systems. Prepare for real engineering!',
    icon: '⚙️',
    color: 'red',
    gradeLevel: '9-12',
    keyStage: 'KS4',
    estimatedMinutes: 180,
    subjects: ['engineering', 'physics', 'technology'],
    standards: ['NGSS-HS-PS2', 'NGSS-ETS1', 'UK-KS4-PHY'],
    prerequisites: ['digital-logic-intro'],
    certificateId: 'cert-electronics-engineer',
    modules: [
      {
        id: 'ee-module-1',
        pathId: 'electronics-engineering',
        order: 1,
        title: 'Transistor Fundamentals',
        description: 'Master the transistor - the heart of modern electronics',
        difficulty: 'advanced',
        estimatedMinutes: 45,
        learningObjectives: [
          'Explain transistor operation (NPN/PNP)',
          'Use transistors as switches',
          'Calculate base resistor values',
        ],
        vocabulary: [
          { term: 'Transistor', definition: 'A semiconductor that amplifies or switches signals', gradeAppropriate: ['9-12'] },
          { term: 'Base', definition: 'Control terminal that turns the transistor on/off', gradeAppropriate: ['9-12'] },
          { term: 'Collector/Emitter', definition: 'Main current path controlled by the base', gradeAppropriate: ['9-12'] },
          { term: 'Gain (β)', definition: 'Amplification factor: I_collector = β × I_base', gradeAppropriate: ['9-12'] },
        ],
        activities: [
          {
            id: 'ee-1-transistor',
            type: 'tutorial',
            title: 'Transistor Basics',
            description: 'Use a transistor to switch an LED',
            tutorialLevelId: 'advanced_1',
            xpReward: 100,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-HS-PS2', 'UK-KS4-PHY'],
      },
      {
        id: 'ee-module-2',
        pathId: 'electronics-engineering',
        order: 2,
        title: 'Capacitors and Timing',
        description: 'Learn about energy storage and RC timing circuits',
        difficulty: 'advanced',
        estimatedMinutes: 45,
        learningObjectives: [
          'Understand capacitor charging/discharging',
          'Calculate time constants (τ = R × C)',
          'Design RC timing circuits',
        ],
        vocabulary: [
          { term: 'Capacitor', definition: 'Stores energy in an electric field', gradeAppropriate: ['9-12'] },
          { term: 'Capacitance', definition: 'Ability to store charge, measured in Farads', gradeAppropriate: ['9-12'] },
          { term: 'Time constant (τ)', definition: 'τ = R × C, time to reach 63% charge', gradeAppropriate: ['9-12'] },
          { term: 'RC circuit', definition: 'Resistor-capacitor combination for timing', gradeAppropriate: ['9-12'] },
        ],
        activities: [
          {
            id: 'ee-2-capacitor',
            type: 'tutorial',
            title: 'Capacitor Charging',
            description: 'Build an RC circuit and observe charging',
            tutorialLevelId: 'advanced_2',
            xpReward: 100,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-HS-PS2', 'UK-KS4-PHY'],
      },
      {
        id: 'ee-module-3',
        pathId: 'electronics-engineering',
        order: 3,
        title: 'Oscillators and Timing',
        description: 'Create circuits that oscillate automatically',
        difficulty: 'expert',
        estimatedMinutes: 45,
        learningObjectives: [
          'Build an astable oscillator',
          'Control oscillation frequency',
          'Understand feedback in oscillators',
        ],
        vocabulary: [
          { term: 'Oscillator', definition: 'Circuit that switches states repeatedly', gradeAppropriate: ['9-12'] },
          { term: 'Astable', definition: 'Has no stable state - always changing', gradeAppropriate: ['9-12'] },
          { term: 'Frequency', definition: 'How fast the oscillator switches', gradeAppropriate: ['9-12'] },
        ],
        activities: [
          {
            id: 'ee-3-blinker',
            type: 'tutorial',
            title: 'LED Blinker',
            description: 'Build an automatic blinking circuit',
            tutorialLevelId: 'advanced_3',
            xpReward: 120,
            requiredForProgress: true,
          },
        ],
        standardsAddressed: ['NGSS-HS-PS2', 'NGSS-ETS1'],
      },
      {
        id: 'ee-module-4',
        pathId: 'electronics-engineering',
        order: 4,
        title: 'Amplifier Design',
        description: 'Design a transistor amplifier circuit',
        difficulty: 'expert',
        estimatedMinutes: 45,
        learningObjectives: [
          'Design a common-emitter amplifier',
          'Calculate bias resistors',
          'Understand voltage gain',
        ],
        vocabulary: [
          { term: 'Amplifier', definition: 'Circuit that increases signal strength', gradeAppropriate: ['9-12'] },
          { term: 'Bias', definition: 'DC voltage that sets the operating point', gradeAppropriate: ['9-12'] },
          { term: 'Gain', definition: 'Ratio of output to input signal', gradeAppropriate: ['9-12'] },
        ],
        activities: [
          {
            id: 'ee-4-amp',
            type: 'tutorial',
            title: 'Transistor Amplifier',
            description: 'Build a signal amplifier',
            tutorialLevelId: 'advanced_4',
            xpReward: 130,
            requiredForProgress: true,
          },
          {
            id: 'ee-4-sensor',
            type: 'tutorial',
            title: 'Final Project',
            description: 'Build a light-controlled circuit',
            tutorialLevelId: 'advanced_5',
            xpReward: 150,
            requiredForProgress: true,
          },
        ],
        assessment: {
          type: 'project',
          projectPrompt: 'Design and build a circuit that automatically turns on an LED when it gets dark. Document your design choices and calculations.',
          passingScore: 70,
        },
        standardsAddressed: ['NGSS-HS-PS2', 'NGSS-ETS1', 'UK-KS4-PHY'],
      },
    ],
  },
];

// ==================== Helper Functions ====================

/**
 * Get a learning path by ID
 */
export function getLearningPathById(pathId: string): LearningPath | undefined {
  return LEARNING_PATHS.find(p => p.id === pathId);
}

/**
 * Get learning paths for a specific grade level
 */
export function getLearningPathsForGrade(grade: string): LearningPath[] {
  return LEARNING_PATHS.filter(p => p.gradeLevel === grade);
}

/**
 * Get certificate by ID
 */
export function getCertificateById(certId: string): Certificate | undefined {
  return CERTIFICATES.find(c => c.id === certId);
}

/**
 * Get certificate for a learning path
 */
export function getCertificateForPath(pathId: string): Certificate | undefined {
  return CERTIFICATES.find(c => c.pathId === pathId);
}

/**
 * Get all skills
 */
export function getAllSkills(): Skill[] {
  return SKILLS;
}

/**
 * Get skills for a grade level
 */
export function getSkillsForGrade(grade: string): Skill[] {
  return SKILLS.filter(s => s.gradeLevel === grade);
}

/**
 * Calculate total XP for a learning path
 */
export function calculatePathTotalXP(pathId: string): number {
  const path = getLearningPathById(pathId);
  if (!path) return 0;

  return path.modules.reduce((total, module) => {
    const moduleXP = module.activities.reduce((sum, act) => sum + act.xpReward, 0);
    return total + moduleXP;
  }, 0);
}

/**
 * Get all modules across all paths
 */
export function getAllModules(): Array<LearningModule & { pathTitle: string }> {
  return LEARNING_PATHS.flatMap(path =>
    path.modules.map(module => ({
      ...module,
      pathTitle: path.title,
    }))
  );
}
