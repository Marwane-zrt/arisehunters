export interface Routine {
  id: string;
  name: string;
  description?: string;
  color: string;
  habitIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineFormData {
  name: string;
  description?: string;
  color: string;
  habitIds: string[];
}