export interface Rule {
  id: string;
  title: string;
  description: string;
  color: string;
  category: string;
  isActive: boolean;
  totalDaysChecked: number;
  daysRespected: number;
  daysViolated: number;
  currentStreak: number;
  bestStreak: number;
  createdAt: Date;
}

export interface RuleFormData {
  title: string;
  description: string;
  color: string;
  category: string;
}

export interface RuleViolation {
  id: string;
  ruleId: string;
  violationDate: Date;
  reason: string;
  preventionPlan: string;
  createdAt: Date;
}

export interface RuleViolationFormData {
  reason: string;
  preventionPlan: string;
}

export interface RuleDailyCheck {
  id: string;
  ruleId: string;
  checkDate: Date;
  respected: boolean;
  createdAt: Date;
}

export interface RuleHistory {
  rule: Rule;
  violations: RuleViolation[];
  dailyChecks: RuleDailyCheck[];
}