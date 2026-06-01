export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface RankInfo {
  rank: Rank;
  color: string;
  minPoints: number;
  maxPoints: number;
  stamina: number;
  maxGoals: number;
  maxSkills: number;
  maxRules: number;
  description: string;
}

export const RANK_THRESHOLDS: RankInfo[] = [
  { rank: 'E', color: '#6B7280', minPoints: 0, maxPoints: 24, stamina: 6, maxGoals: 1, maxSkills: 3, maxRules: 3, description: 'Novice Hunter' },
  { rank: 'D', color: '#EF4444', minPoints: 25, maxPoints: 74, stamina: 7, maxGoals: 2, maxSkills: 4, maxRules: 4, description: 'Awakened Hunter' },
  { rank: 'C', color: '#F97316', minPoints: 75, maxPoints: 149, stamina: 8, maxGoals: 3, maxSkills: 6, maxRules: 5, description: 'Elite Hunter' },
  { rank: 'B', color: '#EAB308', minPoints: 150, maxPoints: 299, stamina: 10, maxGoals: 5, maxSkills: 8, maxRules: 7, description: 'Master Hunter' },
  { rank: 'A', color: '#22C55E', minPoints: 300, maxPoints: 499, stamina: 12, maxGoals: 8, maxSkills: 10, maxRules: 10, description: 'Shadow Hunter' },
  { rank: 'S', color: '#8B5CF6', minPoints: 500, maxPoints: Infinity, stamina: 15, maxGoals: 99, maxSkills: 99, maxRules: 99, description: 'Sovereign Hunter' },
];

export const getRankFromPoints = (points: number): RankInfo => {
  return RANK_THRESHOLDS.find(threshold => 
    points >= threshold.minPoints && points <= threshold.maxPoints
  ) || RANK_THRESHOLDS[0];
};

export const getNextRank = (currentPoints: number): RankInfo | null => {
  const currentRankIndex = RANK_THRESHOLDS.findIndex(threshold => 
    currentPoints >= threshold.minPoints && currentPoints <= threshold.maxPoints
  );
  
  if (currentRankIndex === -1 || currentRankIndex === RANK_THRESHOLDS.length - 1) {
    return null; // Already at max rank or error
  }
  
  return RANK_THRESHOLDS[currentRankIndex + 1];
};

export const getPointsToNextRank = (currentPoints: number): number => {
  const nextRank = getNextRank(currentPoints);
  return nextRank ? nextRank.minPoints - currentPoints : 0;
};