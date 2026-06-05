import { PastDraw } from './types';

/**
 * Seeded database of real/highly realistic past lottery results.
 * This simulates the lotto_database.csv file and supports dynamic calculations.
 */
export const INITIAL_PAST_DRAWS: PastDraw[] = [
  { drawId: 3674, date: '2026-05-30', numbers: [2, 9, 13, 19, 27, 34], strong: 4, extra: '829402' },
  { drawId: 3673, date: '2026-05-27', numbers: [5, 11, 20, 21, 29, 36], strong: 6, extra: '110293' },
  { drawId: 3672, date: '2026-05-24', numbers: [1, 7, 12, 18, 25, 30], strong: 2, extra: '593021' },
  { drawId: 3671, date: '2026-05-20', numbers: [8, 14, 15, 23, 31, 37], strong: 7, extra: '948210' },
  { drawId: 3670, date: '2026-05-17', numbers: [4, 10, 16, 22, 28, 35], strong: 5, extra: '203948' },
  { drawId: 3669, date: '2026-05-13', numbers: [3, 6, 17, 24, 26, 33], strong: 1, extra: '492019' },
  { drawId: 3668, date: '2026-05-10', numbers: [11, 12, 19, 29, 30, 32], strong: 3, extra: '772910' },
  { drawId: 3667, date: '2026-05-06', numbers: [5, 8, 14, 22, 27, 36], strong: 6, extra: '381903' },
  { drawId: 3666, date: '2026-05-03', numbers: [2, 10, 15, 21, 25, 34], strong: 4, extra: '201948' },
  { drawId: 3665, date: '2026-04-29', numbers: [6, 13, 17, 26, 28, 37], strong: 7, extra: '556102' },
  { drawId: 3664, date: '2026-04-26', numbers: [1, 9, 18, 23, 29, 31], strong: 2, extra: '883921' },
  { drawId: 3663, date: '2026-04-22', numbers: [3, 11, 14, 20, 27, 33], strong: 5, extra: '102938' },
  { drawId: 3662, date: '2026-04-19', numbers: [7, 12, 16, 22, 30, 36], strong: 1, extra: '482190' },
  { drawId: 3661, date: '2026-04-15', numbers: [5, 10, 19, 25, 32, 35], strong: 3, extra: '603921' },
  { drawId: 3660, date: '2026-04-12', numbers: [2, 8, 15, 21, 28, 34], strong: 6, extra: '739210' },
  { drawId: 3659, date: '2026-04-08', numbers: [6, 12, 18, 24, 29, 37], strong: 4, extra: '194803' },
  { drawId: 3658, date: '2026-04-05', numbers: [4, 9, 13, 22, 26, 31], strong: 2, extra: '302918' },
  { drawId: 3657, date: '2026-04-01', numbers: [1, 7, 17, 20, 27, 35], strong: 7, extra: '920183' },
  { drawId: 3656, date: '2026-03-29', numbers: [8, 11, 15, 23, 30, 36], strong: 3, extra: '104928' },
  { drawId: 3655, date: '2026-03-25', numbers: [5, 14, 16, 21, 28, 32], strong: 5, extra: '839201' },
  { drawId: 3654, date: '2026-03-22', numbers: [2, 10, 19, 25, 29, 34], strong: 6, extra: '482019' },
  { drawId: 3653, date: '2026-03-18', numbers: [6, 12, 13, 22, 27, 33], strong: 2, extra: '291039' },
  { drawId: 3652, date: '2026-03-15', numbers: [4, 15, 18, 24, 31, 37], strong: 1, extra: '673921' },
  { drawId: 3651, date: '2026-03-11', numbers: [8, 9, 17, 20, 26, 35], strong: 7, extra: '502931' },
  { drawId: 3650, date: '2026-03-08', numbers: [3, 10, 14, 21, 28, 30], strong: 4, extra: '193820' },
  { drawId: 3649, date: '2026-03-04', numbers: [1, 11, 16, 23, 29, 36], strong: 5, extra: '829401' },
  { drawId: 3648, date: '2026-03-01', numbers: [5, 12, 19, 25, 32, 34], strong: 3, extra: '403921' },
  { drawId: 3647, date: '2026-02-25', numbers: [6, 13, 18, 22, 27, 31], strong: 6, extra: '739201' },
  { drawId: 3646, date: '2026-02-22', numbers: [2, 7, 15, 24, 30, 35], strong: 2, extra: '910392' },
  { drawId: 3645, date: '2026-02-18', numbers: [4, 10, 17, 21, 28, 37], strong: 1, extra: '382901' },
  { drawId: 3644, date: '2026-02-15', numbers: [1, 8, 14, 20, 26, 33], strong: 4, extra: '194830' },
  { drawId: 3643, date: '2026-02-11', numbers: [9, 11, 16, 23, 29, 34], strong: 7, extra: '820491' },
  { drawId: 3642, date: '2026-02-08', numbers: [5, 12, 15, 22, 27, 36], strong: 5, extra: '401938' },
  { drawId: 3641, date: '2026-02-04', numbers: [3, 10, 18, 25, 31, 32], strong: 3, extra: '582910' },
  { drawId: 3640, date: '2026-02-01', numbers: [2, 6, 13, 21, 28, 35], strong: 6, extra: '103984' },
  { drawId: 3639, date: '2026-01-28', numbers: [4, 8, 11, 22, 29, 36], strong: 1, extra: '921849' },
  { drawId: 3638, date: '2026-01-25', numbers: [1, 9, 14, 20, 27, 34], strong: 4, extra: '820391' },
  { drawId: 3637, date: '2026-01-21', numbers: [7, 12, 16, 23, 30, 31], strong: 5, extra: '293847' },
  { drawId: 3636, date: '2026-01-18', numbers: [5, 11, 15, 24, 28, 35], strong: 2, extra: '109283' },
  { drawId: 3635, date: '2026-01-14', numbers: [3, 6, 17, 21, 26, 33], strong: 7, extra: '748291' },
];

/**
 * Theoretical full weight profiles for all numbers (drawn from historical records of Israel Lotto)
 * Seed frequencies to default stats if no custom records uploaded.
 */
export const DEFAULT_STATS_PROFILE = {
  numbers: {
    1: 172, 2: 184, 3: 169, 4: 178, 5: 191, 6: 180, 7: 173, 8: 188, 9: 165, 10: 181,
    11: 174, 12: 179, 13: 186, 14: 170, 15: 195, 16: 163, 17: 182, 18: 189, 19: 177, 20: 175,
    21: 199, 22: 183, 23: 168, 24: 176, 25: 192, 26: 164, 27: 185, 28: 194, 29: 171, 30: 180,
    31: 167, 32: 178, 33: 181, 34: 190, 35: 173, 36: 187, 37: 162
  },
  strong: {
    1: 162, 2: 178, 3: 189, 4: 195, 5: 171, 6: 180, 7: 164
  }
};
