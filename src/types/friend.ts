export interface Friend {
  id: string;
  userId: string;
  friendUserId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendProfile {
  id: string;
  userId: string;
  uniqueId: string;
  nickname?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendWithProfile extends Friend {
  friendProfile: FriendProfile;
}