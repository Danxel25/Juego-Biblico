export interface WeeklyEvent {
  id: string;
  title: string;
  description:string;
  themeCategory: string; // e.g., 'Reyes - David'
  endDate: string; // ISO string
  goal: number; // e.g., 10 correct answers
  rewards: {
    xp: number;
    fe: number;
    talents: number;
  };
}

export interface EventProgress {
  eventId: string;
  score: number;
  rewardClaimed: boolean;
}
