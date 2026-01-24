export interface UserProfile {
  id: string;
  userId: string;
  uniqueId: string;
  nickname?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileFormData {
  nickname?: string;
}