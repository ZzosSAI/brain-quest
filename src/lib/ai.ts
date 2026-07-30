import { Subject } from '../game/types';

export interface GeneratedQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  subject: Subject;
  difficulty: number;
  hint: string;
  explanation: string;
}

// ─── Fallback question bank (used when AI API is unavailable) ───

const QUESTION_BANK: Record<string, GeneratedQuestion[]> = {
  mathematics: [
    { question: 'What is 12 × 8?', choices: ['84', '96', '108', '72'], correctIndex: 1, subject: 'mathematics', difficulty: 3, hint: 'Try 10×8 + 2×8', explanation: '12 × 8 = 96' },
    { question: 'What is the square root of 144?', choices: ['10', '11', '12', '14'], correctIndex: 2, subject: 'mathematics', difficulty: 4, hint: 'What number multiplied by itself equals 144?', explanation: '12 × 12 = 144' },
    { question: 'What is ⅓ of 90?', choices: ['20', '25', '30', '45'], correctIndex: 2, subject: 'mathematics', difficulty: 3, hint: 'Divide 90 by 3', explanation: '90 ÷ 3 = 30' },
    { question: 'If a triangle has angles 45° and 45°, what is the third?', choices: ['45°', '60°', '90°', '100°'], correctIndex: 2, subject: 'mathematics', difficulty: 5, hint: 'Angles in a triangle add to 180°', explanation: '180 - 45 - 45 = 90°' },
    { question: 'What is 25% of 200?', choices: ['25', '40', '50', '75'], correctIndex: 2, subject: 'mathematics', difficulty: 4, hint: '25% is the same as ¼', explanation: '200 × 0.25 = 50' },
    { question: 'How many sides does a hexagon have?', choices: ['4', '5', '6', '8'], correctIndex: 2, subject: 'mathematics', difficulty: 1, hint: 'Hexa- means six', explanation: 'A hexagon has 6 sides' },
    { question: 'What is 7²?', choices: ['14', '42', '49', '56'], correctIndex: 2, subject: 'mathematics', difficulty: 2, hint: '7 × 7', explanation: '7² = 49' },
    { question: 'What comes next: 2, 4, 8, 16, __?', choices: ['20', '24', '32', '64'], correctIndex: 2, subject: 'mathematics', difficulty: 3, hint: 'Each number doubles the previous', explanation: '16 × 2 = 32' },
    { question: 'What is the perimeter of a square with side 6cm?', choices: ['12cm', '18cm', '24cm', '36cm'], correctIndex: 2, subject: 'mathematics', difficulty: 3, hint: 'A square has 4 equal sides', explanation: '6 × 4 = 24cm' },
    { question: 'What is 0.5 written as a fraction?', choices: ['1/5', '1/4', '1/3', '1/2'], correctIndex: 3, subject: 'mathematics', difficulty: 1, hint: '0.5 = five tenths', explanation: '0.5 = ½' },
  ],
  science: [
    { question: 'What planet is known as the Red Planet?', choices: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctIndex: 2, subject: 'science', difficulty: 1, hint: 'It\'s named after the Roman god of war', explanation: 'Mars has a reddish appearance' },
    { question: 'What gas do plants absorb from the air?', choices: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctIndex: 2, subject: 'science', difficulty: 3, hint: 'They use it to make food through photosynthesis', explanation: 'Plants absorb CO₂ for photosynthesis' },
    { question: 'What is H₂O?', choices: ['Salt', 'Sugar', 'Water', 'Oxygen'], correctIndex: 2, subject: 'science', difficulty: 1, hint: 'We drink it every day', explanation: 'H₂O is the chemical formula for water' },
    { question: 'What force keeps us on the ground?', choices: ['Magnetism', 'Gravity', 'Friction', 'Pressure'], correctIndex: 1, subject: 'science', difficulty: 2, hint: 'What pulls things toward Earth?', explanation: 'Gravity pulls everything toward Earth' },
    { question: 'What organ pumps blood through your body?', choices: ['Lungs', 'Brain', 'Heart', 'Liver'], correctIndex: 2, subject: 'science', difficulty: 1, hint: 'It beats about 70 times per minute', explanation: 'The heart pumps blood through the body' },
    { question: 'What is the largest mammal?', choices: ['Elephant', 'Blue Whale', 'Giraffe', 'Rhino'], correctIndex: 1, subject: 'science', difficulty: 2, hint: 'It lives in the ocean', explanation: 'Blue whales are the largest animals on Earth' },
    { question: 'What does a caterpillar turn into?', choices: ['Frog', 'Bird', 'Butterfly', 'Bee'], correctIndex: 2, subject: 'science', difficulty: 1, hint: 'It goes through metamorphosis', explanation: 'Caterpillars become butterflies' },
    { question: 'What planet is closest to the Sun?', choices: ['Venus', 'Earth', 'Mercury', 'Mars'], correctIndex: 2, subject: 'science', difficulty: 1, hint: 'It\'s the smallest planet', explanation: 'Mercury is closest to the Sun' },
    { question: 'How many bones does an adult human have?', choices: ['106', '206', '306', '406'], correctIndex: 1, subject: 'science', difficulty: 4, hint: 'A newborn has about 270', explanation: 'Adults have 206 bones' },
    { question: 'What type of rock is formed from cooled lava?', choices: ['Sedimentary', 'Metamorphic', 'Igneous', 'Fossil'], correctIndex: 2, subject: 'science', difficulty: 5, hint: 'Igneous comes from the Latin for "fire"', explanation: 'Igneous rock forms from cooled lava' },
  ],
  english: [
    { question: 'Which word is a synonym for "happy"?', choices: ['Sad', 'Angry', 'Joyful', 'Tired'], correctIndex: 2, subject: 'english', difficulty: 1, hint: 'It means feeling pleasure', explanation: 'Joyful means full of joy' },
    { question: 'What is the past tense of "run"?', choices: ['Runned', 'Ran', 'Running', 'Runs'], correctIndex: 1, subject: 'english', difficulty: 2, hint: 'It follows the "i-a-u" pattern', explanation: 'The past tense of run is ran' },
    { question: 'Which is a complete sentence?', choices: ['Running fast', 'The dog ran', 'Because happy', 'Under the'], correctIndex: 1, subject: 'english', difficulty: 3, hint: 'A sentence needs a subject and a verb', explanation: '"The dog ran" has both a subject and verb' },
    { question: 'What is a noun?', choices: ['An action', 'A describing word', 'A person/place/thing', 'A joining word'], correctIndex: 2, subject: 'english', difficulty: 2, hint: 'It\'s a naming word', explanation: 'A noun names a person, place, or thing' },
    { question: 'Correct the spelling: "recieve"', choices: ['receeve', 'receive', 'receve', 'recive'], correctIndex: 1, subject: 'english', difficulty: 3, hint: 'I before E except after C', explanation: 'The correct spelling is "receive"' },
    { question: 'What does "enormous" mean?', choices: ['Tiny', 'Very big', 'Fast', 'Old'], correctIndex: 1, subject: 'english', difficulty: 2, hint: 'Think of "enormity"', explanation: 'Enormous means extremely large' },
    { question: 'What is the opposite of "brave"?', choices: ['Strong', 'Cowardly', 'Loud', 'Quiet'], correctIndex: 1, subject: 'english', difficulty: 1, hint: 'It means lacking courage', explanation: 'Cowardly is the opposite of brave' },
    { question: 'Which word is an adverb?', choices: ['Quick', 'Quickly', 'Quickness', 'Quicken'], correctIndex: 1, subject: 'english', difficulty: 3, hint: 'Adverbs often end in -ly', explanation: 'Quickly describes how something is done' },
  ],
  geography: [
    { question: 'What is the longest river in the world?', choices: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'], correctIndex: 1, subject: 'geography', difficulty: 3, hint: 'It flows through Egypt', explanation: 'The Nile is the longest river' },
    { question: 'What is the capital of Japan?', choices: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], correctIndex: 2, subject: 'geography', difficulty: 1, hint: 'It\'s a huge city with neon lights', explanation: 'Tokyo is the capital of Japan' },
    { question: 'What is the largest continent?', choices: ['Africa', 'Europe', 'Asia', 'North America'], correctIndex: 2, subject: 'geography', difficulty: 2, hint: 'It includes China, India, and Russia', explanation: 'Asia is the largest continent' },
    { question: 'Which ocean is the largest?', choices: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctIndex: 3, subject: 'geography', difficulty: 2, hint: 'It\'s named for being peaceful', explanation: 'The Pacific is the largest ocean' },
  ],
  space: [
    { question: 'How many planets are in our solar system?', choices: ['7', '8', '9', '10'], correctIndex: 1, subject: 'space', difficulty: 1, hint: 'Pluto was reclassified', explanation: 'There are 8 planets in our solar system' },
    { question: 'What is the Sun made of?', choices: ['Liquid rock', 'Iron', 'Hydrogen and Helium', 'Carbon'], correctIndex: 2, subject: 'space', difficulty: 3, hint: 'It\'s a star, mostly gas', explanation: 'The Sun is mostly hydrogen and helium' },
    { question: 'What is Earth\'s only natural satellite?', choices: ['Sun', 'Moon', 'Mars', 'Venus'], correctIndex: 1, subject: 'space', difficulty: 1, hint: 'You can see it at night', explanation: 'The Moon orbits Earth' },
    { question: 'What galaxy is Earth in?', choices: ['Andromeda', 'Milky Way', 'Triangulum', 'Whirlpool'], correctIndex: 1, subject: 'space', difficulty: 2, hint: 'It looks like a milky band in the sky', explanation: 'Earth is in the Milky Way galaxy' },
  ],
  general_knowledge: [
    { question: 'What is the boiling point of water?', choices: ['90°C', '100°C', '110°C', '120°C'], correctIndex: 1, subject: 'general_knowledge', difficulty: 2, hint: 'Standard temperature', explanation: 'Water boils at 100°C at sea level' },
    { question: 'How many days in a year?', choices: ['364', '365', '366', '360'], correctIndex: 1, subject: 'general_knowledge', difficulty: 1, hint: 'Except leap years', explanation: 'There are 365 days in a common year' },
    { question: 'What color are most school buses?', choices: ['Red', 'Blue', 'Yellow', 'Green'], correctIndex: 2, subject: 'general_knowledge', difficulty: 1, hint: 'It\'s a very bright, visible color', explanation: 'School buses are yellow for visibility' },
    { question: 'How many legs does a spider have?', choices: ['6', '8', '10', '12'], correctIndex: 1, subject: 'general_knowledge', difficulty: 1, hint: 'Insects have 6, spiders have more', explanation: 'Spiders have 8 legs' },
  ],
};

const ALL_SUBJECTS: Subject[] = [
  'mathematics', 'science', 'english', 'geography',
  'space', 'general_knowledge'
];

// ─── AI Question Generator ──────────────────────────────
// First tries local fallback bank. In production, call an AI API.

export function generateQuestion(
  difficulty: number,
  avoidSubject?: Subject | null,
  usedQuestions: Set<string> = new Set(),
  subjectOverride?: Subject
): GeneratedQuestion {
  // Pick a subject
  let subject: Subject;
  if (subjectOverride) {
    subject = subjectOverride;
  } else if (avoidSubject) {
    const others = ALL_SUBJECTS.filter(s => s !== avoidSubject);
    subject = others[Math.floor(Math.random() * others.length)];
  } else {
    subject = ALL_SUBJECTS[Math.floor(Math.random() * ALL_SUBJECTS.length)];
  }

  // Get bank for subject
  const bank = QUESTION_BANK[subject] || QUESTION_BANK.mathematics;
  
  // Filter by difficulty range (+-2)
  const candidates = bank.filter(q =>
    Math.abs(q.difficulty - difficulty) <= 2 &&
    !usedQuestions.has(q.question)
  );

  // Fallback: if no unused questions, allow repeats
  const pool = candidates.length > 0 ? candidates : bank;
  const question = pool[Math.floor(Math.random() * pool.length)];

  return {
    ...question,
    difficulty: Math.min(10, Math.max(1, difficulty)),
  };
}

export function adaptDifficulty(
  playerCorrectStreak: number,
  playerWrongStreak: number,
  currentDifficulty: number
): number {
  if (playerCorrectStreak >= 3) return Math.min(10, currentDifficulty + 1);
  if (playerCorrectStreak >= 1) return currentDifficulty;
  if (playerWrongStreak >= 2) return Math.max(1, currentDifficulty - 1);
  return currentDifficulty;
}
