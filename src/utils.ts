import { LottoTable, PastDraw, StatFrequencies } from './types';
import { DEFAULT_STATS_PROFILE } from './data';

/**
 * Calculates current occurrences from historical draw records.
 */
export function calculateStats(draws: PastDraw[]): StatFrequencies {
  const numberFrequencies: { [num: number]: number } = {};
  const strongFrequencies: { [num: number]: number } = {};

  // Initialize
  for (let i = 1; i <= 37; i++) numberFrequencies[i] = DEFAULT_STATS_PROFILE.numbers[i as keyof typeof DEFAULT_STATS_PROFILE.numbers] || 0;
  for (let i = 1; i <= 7; i++) strongFrequencies[i] = DEFAULT_STATS_PROFILE.strong[i as keyof typeof DEFAULT_STATS_PROFILE.strong] || 0;

  // Add historical data
  draws.forEach((draw) => {
    draw.numbers.forEach((num) => {
      if (num >= 1 && num <= 37) {
        numberFrequencies[num] = (numberFrequencies[num] || 0) + 1;
      }
    });
    if (draw.strong >= 1 && draw.strong <= 7) {
      strongFrequencies[draw.strong] = (strongFrequencies[draw.strong] || 0) + 1;
    }
  });

  const totalDraws = draws.length + 300; // virtual base to smooth statistical ratios

  // Extract hot / cold numbers
  const numEntries = Object.entries(numberFrequencies).map(([num, count]) => ({
    num: parseInt(num),
    count,
  }));
  const hotNumbers = [...numEntries].sort((a, b) => b.count - a.count).map((item) => item.num);
  const coldNumbers = [...numEntries].sort((a, b) => a.count - b.count).map((item) => item.num);

  // Calculate average sum of historical numbers (which should be around 114)
  let sumAll = 0;
  let countAll = 0;
  draws.forEach((d) => {
    const drawSum = d.numbers.reduce((acc, n) => acc + n, 0);
    if (drawSum > 0) {
      sumAll += drawSum;
      countAll++;
    }
  });
  const averageSum = countAll > 0 ? Math.round(sumAll / countAll) : 114;

  return {
    numberFrequencies,
    strongFrequencies,
    totalDraws,
    hotNumbers,
    coldNumbers,
    averageSum,
  };
}

/**
 * Evaluates the structural and statistical viability of a table (6 numbers + strong).
 * Expressed out of 100 percentage points.
 * All translations in clean Hebrew.
 */
export function scoreCombination(numbers: number[], strong: number): {
  score: number;
  details: LottoTable['scoreDetails'];
} {
  const sorted = [...numbers].sort((a, b) => a - b);
  const details: LottoTable['scoreDetails'] = [];

  // 1. Even-Odd Ratio
  let evenCount = 0;
  let oddCount = 0;
  sorted.forEach((n) => {
    if (n % 2 === 0) evenCount++;
    else oddCount++;
  });
  let evenOddScore = 25;
  let evenOddFeedback = `איזון מושלם של ${oddCount} אי-זוגיים ו-${evenCount} זוגיים.`;
  let evenOddStatus: 'optimal' | 'moderate' | 'poor' = 'optimal';

  if (evenCount === 3 && oddCount === 3) {
    evenOddScore = 25;
  } else if ((evenCount === 2 && oddCount === 4) || (evenCount === 4 && oddCount === 2)) {
    evenOddScore = 18;
    evenOddFeedback = `איזון סביר של ${oddCount} אי-זוגיים ו-${evenCount} זוגיים.`;
    evenOddStatus = 'optimal'; // Still highly acceptable
  } else if ((evenCount === 1 && oddCount === 5) || (evenCount === 5 && oddCount === 1)) {
    evenOddScore = 8;
    evenOddFeedback = `מדד חלש: צירוף של ${oddCount} אי-זוגיים ו-${evenCount} זוגיים הוא די נדיר.`;
    evenOddStatus = 'moderate';
  } else {
    evenOddScore = 2;
    evenOddFeedback = `קיצוני ולא מומלץ: כל המספרים הם ${evenCount === 6 ? 'זוגיים' : 'אי-זוגיים'}.`;
    evenOddStatus = 'poor';
  }
  details.push({
    title: 'חלוקת זוגי / אי-זוגי',
    score: evenOddScore,
    max: 25,
    feedback: evenOddFeedback,
    status: evenOddStatus,
  });

  // 2. Sum range
  const sum = sorted.reduce((acc, n) => acc + n, 0);
  let sumScore = 25;
  let sumFeedback = `סכום מצוין של ${sum} (בטווח האידיאלי של 95-135).`;
  let sumStatus: 'optimal' | 'moderate' | 'poor' = 'optimal';

  if (sum >= 95 && sum <= 135) {
    sumScore = 25;
  } else if ((sum >= 75 && sum < 95) || (sum > 135 && sum <= 155)) {
    sumScore = 16;
    sumFeedback = `סכום בינוני של ${sum}. נוטה מעט לערכים ${sum < 95 ? 'נמוכים' : 'גבוהים'}.`;
    sumStatus = 'moderate';
  } else {
    sumScore = 5;
    sumFeedback = `סכום קיצוני של ${sum} (מחוץ לטווח הגיוני סטטיסטית).`;
    sumStatus = 'poor';
  }
  details.push({
    title: 'סכום המספרים',
    score: sumScore,
    max: 25,
    feedback: sumFeedback,
    status: sumStatus,
  });

  // 3. Consecutive sets (רצפים עוקבים)
  let consecutivePairs = 0;
  let maxConsecRun = 1;
  let currentRun = 1;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] === 1) {
      consecutivePairs++;
      currentRun++;
      if (currentRun > maxConsecRun) maxConsecRun = currentRun;
    } else {
      currentRun = 1;
    }
  }

  let consecScore = 25;
  let consecFeedback = 'אין מספרים עוקבים או שיש רצף בודד תקין (סטנדרטי לחלוטין).';
  let consecStatus: 'optimal' | 'moderate' | 'poor' = 'optimal';

  if (maxConsecRun === 1) {
    consecScore = 25;
    consecFeedback = 'מושלם: אין אף זוג מספרים עוקבים בטבלה.';
  } else if (maxConsecRun === 2 && consecutivePairs === 1) {
    consecScore = 25;
    consecFeedback = 'תקין: רצף עוקב בודד של 2 מספרים (נפוץ מאוד בהגרלות).';
  } else if (maxConsecRun === 2 && consecutivePairs === 2) {
    consecScore = 15;
    consecFeedback = 'סביר: שני זוגות של עוקבים (למשל 12,13 וגם 28,29).';
    consecStatus = 'optimal';
  } else if (maxConsecRun === 3) {
    consecScore = 10;
    consecFeedback = 'בינוני: שלשייה עוקבת של מספרים (למשל 14,15,16).';
    consecStatus = 'moderate';
  } else {
    consecScore = 3;
    consecFeedback = `רמת סיכוי נמוכה: יש רצף של ${maxConsecRun} מספרים עוקבים.`;
    consecStatus = 'poor';
  }
  details.push({
    title: 'רצפים ומספרים עוקבים',
    score: consecScore,
    max: 25,
    feedback: consecFeedback,
    status: consecStatus,
  });

  // 4. Low-High split (נמוכים 1-18 לעומת גבוהים 19-37)
  let lowCount = 0;
  let highCount = 0;
  sorted.forEach((n) => {
    if (n <= 18) lowCount++;
    else highCount++;
  });

  let lowHighScore = 25;
  let lowHighFeedback = `איזון מושלם של ${lowCount} מספרים נמוכים ו-${highCount} גבוהים.`;
  let lowHighStatus: 'optimal' | 'moderate' | 'poor' = 'optimal';

  if (lowCount === 3 && highCount === 3) {
    lowHighScore = 25;
  } else if ((lowCount === 2 && highCount === 4) || (lowCount === 4 && highCount === 2)) {
    lowHighScore = 20;
    lowHighFeedback = `איזון סביר של ${lowCount} נמוכים ו-${highCount} גבוהים.`;
    lowHighStatus = 'optimal';
  } else if ((lowCount === 1 && highCount === 5) || (lowCount === 5 && highCount === 1)) {
    lowHighScore = 8;
    lowHighFeedback = `בינוני: חלוקת נמוכים/גבוהים לא מאוזנת (${lowCount} לעומת ${highCount}).`;
    lowHighStatus = 'moderate';
  } else {
    lowHighScore = 2;
    lowHighFeedback = `לא מומלץ: כל המספרים הם ${lowCount === 6 ? 'נמוכים (1-18)' : 'גבוהים (19-37)'}.`;
    lowHighStatus = 'poor';
  }
  details.push({
    title: 'חלוקת נמוכים / גבוהים',
    score: lowHighScore,
    max: 25,
    feedback: lowHighFeedback,
    status: lowHighStatus,
  });

  // Compute final combined score out of 100, but cap at 94% to prevent false expectations of guaranteed wins (since lottery is 100% luck in real life)
  const rawScore = evenOddScore + sumScore + consecScore + lowHighScore;
  const score = Math.min(94, rawScore);

  return {
    score,
    details,
  };
}

/**
 * Weighted random selector from a pool of options.
 */
function weightedSample(pool: number[], weights: { [num: number]: number }, k: number): number[] {
  const chosen: number[] = [];
  const poolCopy = [...pool];

  while (chosen.length < k && poolCopy.length > 0) {
    // calculate sum of weights for remainder
    let sumWeights = 0;
    poolCopy.forEach((num) => {
      sumWeights += weights[num] || 1;
    });

    const randVal = Math.random() * sumWeights;
    let accumulated = 0;
    let selectedIndex = -1;

    for (let i = 0; i < poolCopy.length; i++) {
      accumulated += weights[poolCopy[i]] || 1;
      if (randVal <= accumulated) {
        selectedIndex = i;
        break;
      }
    }

    if (selectedIndex !== -1) {
      chosen.push(poolCopy[selectedIndex]);
      poolCopy.splice(selectedIndex, 1);
    } else {
      // fallback
      const idx = Math.floor(Math.random() * poolCopy.length);
      chosen.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }
  }

  return chosen.sort((a, b) => a - b);
}

/**
 * Logic-driven generators for different formulas based on stats
 */
export function generateCombination(
  algo: LottoTable['algo'],
  stats: StatFrequencies
): { numbers: number[]; strong: number } {
  const pool37 = Array.from({ length: 37 }, (_, i) => i + 1);

  let numbers: number[] = [];
  // Generate Numbers
  switch (algo) {
    case 'HOT': {
      // Numbers chosen relative to their frequency
      numbers = weightedSample(pool37, stats.numberFrequencies, 6);
      break;
    }
    case 'COLD': {
      // Numbers chosen inversely proportional to their frequency
      const inverseWeights: { [n: number]: number } = {};
      const maxFreq = Math.max(...Object.values(stats.numberFrequencies));
      pool37.forEach((n) => {
        const count = stats.numberFrequencies[n] || 1;
        // Inverse weight: higher if draw count is smaller
        inverseWeights[n] = maxFreq - count + 1;
      });
      numbers = weightedSample(pool37, inverseWeights, 6);
      break;
    }
    case 'BALANCED': {
      // Optimal combinations are randomly sampled until we get one that scores 85+
      for (let attempt = 0; attempt < 500; attempt++) {
        const candidate = weightedSample(pool37, stats.numberFrequencies, 6);
        const evaluation = scoreCombination(candidate, 4);
        if (evaluation.score >= 85) {
          numbers = candidate;
          break;
        }
      }
      if (numbers.length === 0) {
        numbers = weightedSample(pool37, {}, 6);
      }
      break;
    }
    case 'CHANCE': {
      // Play 100 random games and select the one with the absolute highest statistical rating
      let bestCandidate: number[] = [];
      let bestScore = -1;
      for (let i = 0; i < 200; i++) {
        // combine weighted hotness with random elements
        const candidate = weightedSample(pool37, stats.numberFrequencies, 6);
        const evalScore = scoreCombination(candidate, 4).score;
        if (evalScore > bestScore) {
          bestScore = evalScore;
          bestCandidate = candidate;
        }
      }
      numbers = bestCandidate;
      break;
    }
    case 'RANDOM':
    default: {
      // Normal pure random
      numbers = weightedSample(pool37, {}, 6);
      break;
    }
  }

  // Generate strong number (1-7)
  const strongPool = Array.from({ length: 7 }, (_, i) => i + 1);
  const strongWeights = stats.strongFrequencies;
  
  let strong = 4;
  if (algo === 'HOT' || algo === 'CHANCE' || algo === 'BALANCED') {
    strong = weightedSample(strongPool, strongWeights, 1)[0];
  } else if (algo === 'COLD') {
    const inverseStrongWeights: { [n: number]: number } = {};
    const maxStrongFreq = Math.max(...Object.values(strongWeights));
    strongPool.forEach((n) => {
      const count = strongWeights[n] || 1;
      inverseStrongWeights[n] = maxStrongFreq - count + 1;
    });
    strong = weightedSample(strongPool, inverseStrongWeights, 1)[0];
  } else {
    strong = Math.floor(Math.random() * 7) + 1;
  }

  return { numbers, strong };
}

/**
 * Generates a single 6-digit extra number per ticket (form)
 */
export function generateExtraNumber(): string {
  const digits: number[] = [];
  for (let i = 0; i < 6; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  return digits.join('');
}

/**
 * Scores a 777 combination (7 numbers out of 70).
 */
export function score777Combination(numbers: number[], priorDrawNumbers?: number[]): {
  score: number;
  details: LottoTable['scoreDetails'];
} {
  const sorted = [...numbers].sort((a, b) => a - b);
  const details: LottoTable['scoreDetails'] = [];

  const prior = (priorDrawNumbers && priorDrawNumbers.length >= 7) 
    ? priorDrawNumbers 
    : [3, 8, 12, 17, 21, 26, 30, 34, 39, 43, 47, 51, 56, 60, 62, 65, 69];

  // 1. Recurrence score based on user's selected previous draw (חזרה מהגרלת עבר)
  const repeatedCount = sorted.filter(n => prior.includes(n)).length;
  let repeatScore = repeatedCount === 3 ? 25 : (repeatedCount === 2 || repeatedCount === 4) ? 18 : 8;
  details.push({
    title: 'מדד חוק הרגרסיה (חזרה מהגרלה קודמת)',
    score: repeatScore,
    max: 25,
    feedback: repeatedCount === 3 
      ? 'מושלם: הטבלה מכילה בדיוק 3 מספרים חוזרים מהגרלת העבר, חזרה אופטימלית סטטיסטית!'
      : `הטבלה כוללת ${repeatedCount} מספרים מסדרת העבר. שילוב של 3 מספרים מספק צירוף חזק.`,
    status: repeatedCount === 3 ? 'optimal' : 'moderate',
  });

  // even odd
  let evens = 0;
  let odds = 0;
  sorted.forEach(n => n % 2 === 0 ? evens++ : odds++);
  let evenOddScore = (evens === 3 || evens === 4) ? 25 : (evens === 2 || evens === 5) ? 18 : 10;
  details.push({
    title: 'חלוקת זוגי / אי-זוגי',
    score: evenOddScore,
    max: 25,
    feedback: `יחס של ${odds} אי-זוגיים ו-${evens} זוגיים. שילוב ${evenOddScore === 25 ? 'אופטימלי' : 'סביר'}.`,
    status: evenOddScore === 25 ? 'optimal' : 'moderate',
  });

  // high low
  let lows = 0;
  let highs = 0;
  sorted.forEach(n => n <= 35 ? lows++ : highs++);
  let highLowScore = (lows === 3 || lows === 4) ? 25 : (lows === 2 || lows === 5) ? 18 : 10;
  details.push({
    title: 'חלוקת נמוכים / גבוהים',
    score: highLowScore,
    max: 25,
    feedback: `יחס של ${lows} נמוכים לעומת ${highs} גבוהים. ${highLowScore === 25 ? 'איזון מושלם' : 'מאוזן סביר'}.`,
    status: highLowScore === 25 ? 'optimal' : 'moderate',
  });

  // sum
  const sum = sorted.reduce((a, b) => a + b, 0);
  let sumScore = (sum >= 200 && sum <= 290) ? 25 : (sum >= 150 && sum <= 340) ? 16 : 8;
  details.push({
    title: 'סכום המספרים',
    score: sumScore,
    max: 25,
    feedback: `סכום הטבלה הוא ${sum}. ${sumScore === 25 ? 'בטווח הסטטיסטי האידיאלי' : 'מעט קיצוני'}.`,
    status: sumScore === 25 ? 'optimal' : 'moderate',
  });

  const rawScore = repeatScore + evenOddScore + highLowScore + sumScore;
  const score = Math.min(94, rawScore);
  return { score, details: details || [] };
}

/**
 * Generates a 777 combination
 */
export function generate777Combination(algo: LottoTable['algo'], priorDrawNumbers?: number[]): number[] {
  const pool70 = Array.from({ length: 70 }, (_, i) => i + 1);
  const selected: number[] = [];
  
  const prior = (priorDrawNumbers && priorDrawNumbers.length >= 7) 
    ? priorDrawNumbers 
    : [3, 8, 12, 17, 21, 26, 30, 34, 39, 43, 47, 51, 56, 60, 62, 65, 69]; // Seeded default 17 prior numbers

  if (algo !== 'RANDOM') {
    // Pick exactly 3 numbers from the prior draw elements
    const priorCopy = [...prior];
    const pickedFromPrior: number[] = [];
    while (pickedFromPrior.length < 3 && priorCopy.length > 0) {
      const idx = Math.floor(Math.random() * priorCopy.length);
      pickedFromPrior.push(priorCopy[idx]);
      priorCopy.splice(idx, 1);
    }

    // Pick remaining 4 numbers from the pool outside the prior draw to ensure exactly 3 numbers repeat
    const externalPool = pool70.filter(n => !prior.includes(n));
    const pickedExternal: number[] = [];
    while (pickedExternal.length < 4 && externalPool.length > 0) {
      const idx = Math.floor(Math.random() * externalPool.length);
      pickedExternal.push(externalPool[idx]);
      externalPool.splice(idx, 1);
    }

    return [...pickedFromPrior, ...pickedExternal].sort((a, b) => a - b);
  }

  // Pure random fallback
  while (selected.length < 7) {
    const candidate = pool70[Math.floor(Math.random() * pool70.length)];
    if (!selected.includes(candidate)) {
      selected.push(candidate);
    }
  }

  return selected.sort((a, b) => a - b);
}

/**
 * Generates a Chance combination
 */
export function generateChanceCombination(): { suit: string; value: string; isRed: boolean }[] {
  const suits = [
    { name: '♣', isRed: false },
    { name: '♦', isRed: true },
    { name: '♥', isRed: true },
    { name: '♠', isRed: false }
  ];
  const cardValues = ['7', '8', '9', '10', 'נסיך', 'מלכה', 'מלך', 'אס'];

  return suits.map((suit) => {
    const value = cardValues[Math.floor(Math.random() * cardValues.length)];
    return {
      suit: suit.name,
      value,
      isRed: suit.isRed
    };
  });
}
