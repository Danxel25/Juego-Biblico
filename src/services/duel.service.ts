import { Injectable, signal, inject, computed } from '@angular/core';
import { User } from '../models/user.model';
import { Question } from '../models/question.model';
import { QuestionService } from './question.service';
import { AuthService } from './auth.service';
import { AchievementService } from './achievement.service';

type GameState = 'lobby' | 'searching' | 'playing' | 'finished';
type Winner = 'player' | 'opponent' | 'tie' | null;

const DUEL_QUESTIONS_COUNT = 5;
const ROUND_TIME = 15;

@Injectable({
  providedIn: 'root',
})
export class DuelService {
  private questionService = inject(QuestionService);
  private authService = inject(AuthService);
  private achievementService = inject(AchievementService);

  // Game State
  readonly gameState = signal<GameState>('lobby');
  readonly player = signal<User | null>(null);
  readonly opponent = signal<User | null>(null);
  readonly winner = signal<Winner>(null);
  readonly showVsScreen = signal(false);

  // Round State
  private readonly questions = signal<Question[]>([]);
  readonly currentQuestionIndex = signal(0);
  readonly playerScore = signal(0);
  readonly opponentScore = signal(0);
  readonly roundTimer = signal(ROUND_TIME);
  
  // UI State
  readonly selectedAnswer = signal<string | null>(null);
  readonly answerStatus = signal<'correct' | 'incorrect' | null>(null);

  private timerInterval: any;

  // Computed Values
  readonly currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);

  initPlayer(user: User): void {
    this.player.set(user);
  }

  startMatchmaking(): void {
    this.gameState.set('searching');
    this.showVsScreen.set(false);

    // Simulate finding an opponent
    setTimeout(() => {
      this.createMockOpponent();
      this.fetchQuestions();

      // Show VS screen
      this.showVsScreen.set(true);
      
      // Start game after VS screen
      setTimeout(() => {
        this.gameState.set('playing');
        this.startRound();
      }, 2500);

    }, 2000);
  }

  answerQuestion(answer: string): void {
    if (this.selectedAnswer()) return; // Prevent multiple answers

    clearInterval(this.timerInterval);
    this.selectedAnswer.set(answer);

    const isCorrect = answer === this.currentQuestion()?.correctAnswer;
    if (isCorrect) {
      this.answerStatus.set('correct');
      this.playerScore.update(s => s + 1);
      this.authService.incrementUserStats({ correct_answers: 1 });
    } else {
      this.answerStatus.set('incorrect');
    }

    // Simulate opponent's answer
    this.simulateOpponentAnswer();

    // Move to next round or end game
    setTimeout(() => {
      if (this.currentQuestionIndex() < DUEL_QUESTIONS_COUNT - 1) {
        this.currentQuestionIndex.update(i => i + 1);
        this.startRound();
      } else {
        this.endGame();
      }
    }, 1500);
  }
  
  reset(): void {
    clearInterval(this.timerInterval);
    this.gameState.set('lobby');
    this.opponent.set(null);
    this.winner.set(null);
    this.questions.set([]);
    this.currentQuestionIndex.set(0);
    this.playerScore.set(0);
    this.opponentScore.set(0);
    this.roundTimer.set(ROUND_TIME);
    this.selectedAnswer.set(null);
    this.answerStatus.set(null);
    this.showVsScreen.set(false);
  }

  private startRound(): void {
    this.selectedAnswer.set(null);
    this.answerStatus.set(null);
    this.roundTimer.set(ROUND_TIME);
    
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.roundTimer.update(t => t - 1);
      if (this.roundTimer() <= 0) {
        this.answerQuestion(''); // Timeout counts as a wrong answer
      }
    }, 1000);
  }

  private simulateOpponentAnswer(): void {
    const thinkingTime = Math.random() * 2000 + 500; // 0.5s to 2.5s
    setTimeout(() => {
      // 75% chance of being correct
      if (Math.random() < 0.75) {
        this.opponentScore.update(s => s + 1);
      }
    }, thinkingTime);
  }
  
  private async endGame(): Promise<void> {
    clearInterval(this.timerInterval);
    this.determineWinner();
    this.gameState.set('finished');

    // Grant rewards and stats
    if (this.winner() === 'player') {
      await this.authService.incrementUserStats({ xp: 75, fe: 30, duels_won: 1 });
    } else {
      await this.authService.incrementUserStats({ xp: 25, fe: 10 });
    }

    // Check for achievements
    const user = this.authService.currentUser();
    if(user) {
      await this.achievementService.checkForUnlock(user);
    }
  }

  private determineWinner(): void {
    if (this.playerScore() > this.opponentScore()) {
      this.winner.set('player');
    } else if (this.opponentScore() > this.playerScore()) {
      this.winner.set('opponent');
    } else {
      this.winner.set('tie');
    }
  }

  private fetchQuestions(): void {
    this.questionService.getQuestions(DUEL_QUESTIONS_COUNT).subscribe(questions => {
      this.questions.set(questions);
    });
  }

  private createMockOpponent(): void {
    const names = ['Samuel', 'Elías', 'Débora', 'Gedeón', 'Sara', 'Noé'];
    const titles = ['el Profeta', 'la Jueza', 'el Valiente', 'la Matriarca', 'el Justo'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    const opponentUser: User = {
      uid: `bot_${Date.now()}`,
      email: null,
      customName: `${randomName} ${randomTitle}`,
      avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=${randomName}`,
      level: (this.player()?.level ?? 1) + Math.floor(Math.random() * 3) - 1, // Similar level
      xp: 0,
      title: 'Contendiente Celestial',
      fe: 0,
      talents: 0,
      mottoVerse: { text: '', reference: '' },
    };
    this.opponent.set(opponentUser);
  }
}
