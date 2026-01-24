export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  points: number;
}

export interface CategoryFormData {
  name: string;
  color: string;
}