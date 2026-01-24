export interface PointsHistoryEntry {
  date: string;
  questsCompleted: number;
  questsTotal: number;
  pointsGained: number;
  pointsLost: number;
  netChange: number;
  dailyTotal: number;
  categories: {
    [categoryName: string]: {
      pointsGained: number;
      pointsLost: number;
      questsCompleted: number;
      questsTotal: number;
    };
  };
}

export interface PointsHistoryData {
  entries: PointsHistoryEntry[];
  totalGained: number;
  totalLost: number;
  netTotal: number;
  bestDay: PointsHistoryEntry | null;
  worstDay: PointsHistoryEntry | null;
}