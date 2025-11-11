export interface User {
  uid: string;
  email: string | null;
  customName: string;
  country?: string;
  gender?: 'hombre' | 'mujer';
  dateOfBirth?: string; // ISO String YYYY-MM-DD
  maritalStatus?: 'soltero' | 'casado' | 'en_relacion';
  avatarUrl: string;
  mottoVerse: {
    text: string;
    reference: string;
  };
  level: number;
  xp: number;
  title: string;
  fe: number;
  talents: number;
  consumables?: { [key: string]: number; };
  isGuest?: boolean;
  friends?: string[];
  friendRequestsSent?: string[];
  friendRequestsReceived?: string[];
  unlockedAchievements?: string[];
  duelsWon?: number;
  correctAnswers?: number;
  currentStreak?: number;
  lastLogin?: string; // ISO String YYYY-MM-DD
}
