export type ActivityType = 'pregunta_profunda' | 'completar_versiculo' | 'orden_cronologico' | 'arbol_genealogico' | 'prueba';

export interface ChapterActivity {
  id: string; // e.g., 'gen-1-1'
  type: ActivityType;
  questionText?: string;
  // For 'pregunta_profunda' & 'completar_versiculo'
  options?: string[];
  correctAnswer?: string;
  // For 'orden_cronologico'
  itemsToOrder?: string[];
  correctOrder?: string[];
  // For 'arbol_genealogico'
  connections?: { groupA: string[], groupB: string[] };
  correctConnections?: { [key: string]: string };
  // For 'prueba' (Test) - contains a series of other activities
  questions?: ChapterActivity[];
  
  verse: string; // Reference verse for deep study
}

export interface BibleChapter {
  id: number; // e.g., 1 for Genesis 1
  title: string;
  description: string;
  isTestChapter: boolean;
  activities: ChapterActivity[];
}

export interface CampaignStage {
  title: string;
  description: string;
  chapters: BibleChapter[];
}

export interface BibleBook {
  id: string; // e.g., 'genesis'
  title: string;
  totalChapters: number;
  stages: CampaignStage[];
}

export interface UserCampaignProgress {
  // e.g., { 'genesis': { 1: ['gen-1-1', 'gen-1-2'], 2: [...] } }
  completedActivities: { [bookId: string]: { [chapterId: number]: string[] } };
}
