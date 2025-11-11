import { Component, ChangeDetectionStrategy, signal, computed, effect, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../models/question.model';
import { QuestionService } from '../../services/question.service';
import { GeminiService } from '../../services/gemini.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { Observable } from 'rxjs';

type GameState = 'notStarted' | 'inProgress' | 'finished';
type ChallengeMode = 'normal' | 'event';

@Component({
  selector: 'app-quick-challenge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-challenge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickChallengeComponent implements OnDestroy {
  private questionService = inject(QuestionService);
  private geminiService = inject(GeminiService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private eventService = inject(EventService);

  gameState = signal<GameState>('notStarted');
  challengeMode = signal<ChallengeMode>('normal');
  questions = signal<Question[]>([]);
  currentQuestionIndex = signal(0);
  score = signal(0);
  timer = signal(60);
  consecutiveCorrect = signal(0);
  errors = signal(0);
  isPaused = signal(false);

  // Power-up state
  showVerse = signal(false);
  optionsToRemove = signal<string[]>([]);
  
  // Consumable counts from user profile
  private consumables = computed(() => this.authService.currentUser()?.consumables || {});
  removeOptionsCount = computed(() => this.consumables()['remove_options'] || 0);
  addTimeCount = computed(() => this.consumables()['add_time'] || 0);
  showVerseCount = computed(() => this.consumables()['show_verse'] || 0);

  selectedAnswer = signal<string | null>(null);
  answerStatus = signal<'correct' | 'incorrect' | null>(null);

  isThinkingModalOpen = signal(false);
  thinkingModeContent = signal('');
  isThinking = signal(false);

  private timerInterval: any;
  private readonly storageKey = 'quickChallengeLastScore';
  lastScore = signal<number | null>(null);

  // Event related signals
  activeEvent = this.eventService.activeEvent;

  currentQuestion = computed(() => this.questions()[this.currentQuestionIndex()]);
  scoreMultiplier = computed(() => 1 + Math.floor(this.consecutiveCorrect() / 3));

  filteredOptions = computed(() => {
    const question = this.currentQuestion();
    if (!question) return [];
    if (this.optionsToRemove().length > 0) {
      return question.options.filter(opt => !this.optionsToRemove().includes(opt));
    }
    return question.options;
  });

  constructor() {
    this.loadLastScore();
    const navigationState = this.router.getCurrentNavigation()?.extras.state;
    if (navigationState && navigationState['eventChallenge']) {
      this.startGame('event');
    }

    effect(() => {
        if (this.errors() >= 3) {
            this.endGame();
        }
    });
  }
  
  private loadLastScore(): void {
    try {
      const storedScore = localStorage.getItem(this.storageKey);
      if (storedScore) {
        this.lastScore.set(parseInt(storedScore, 10));
      }
    } catch (error) {
      console.error('Error loading last score from localStorage', error);
    }
  }

  startGame(mode: ChallengeMode = 'normal'): void {
    this.challengeMode.set(mode);
    let questionObservable: Observable<Question[]>;

    if (mode === 'event' && this.activeEvent()) {
      questionObservable = this.questionService.getQuestionsByCategory(this.activeEvent()!.themeCategory, 20);
    } else {
      questionObservable = this.questionService.getQuestions(20);
    }

    questionObservable.subscribe(questions => {
      this.questions.set(questions);
      this.currentQuestionIndex.set(0);
      this.score.set(0);
      this.timer.set(60);
      this.errors.set(0);
      this.consecutiveCorrect.set(0);
      this.isPaused.set(false);
      this.resetPowerUpVisuals();
      this.gameState.set('inProgress');
      this.startTimer();
    });
  }

  startTimer(): void {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer.update(t => t - 1);
      if (this.timer() <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  pauseGame(): void {
    if (this.gameState() === 'inProgress') {
      clearInterval(this.timerInterval);
      this.isPaused.set(true);
    }
  }

  resumeGame(): void {
    if (this.gameState() === 'inProgress' && this.isPaused()) {
      this.isPaused.set(false);
      this.startTimer();
    }
  }

  selectAnswer(option: string): void {
    if (this.selectedAnswer() || this.isPaused()) return;

    this.selectedAnswer.set(option);
    const correct = option === this.currentQuestion()?.correctAnswer;

    if (correct) {
      this.answerStatus.set('correct');
      const points = 10 * this.scoreMultiplier();
      this.score.update(s => s + points);
      this.consecutiveCorrect.update(c => c + 1);
      this.errors.set(0);
      this.authService.incrementUserStats({ correct_answers: 1 });

      if (this.challengeMode() === 'event') {
        this.eventService.recordCorrectAnswer(this.currentQuestion().category);
      }
    } else {
      this.answerStatus.set('incorrect');
      this.timer.update(t => Math.max(0, t - 5));
      this.consecutiveCorrect.set(0);
      this.errors.update(e => e + 1);
    }

    setTimeout(() => this.nextQuestion(), 1200);
  }

  nextQuestion(): void {
    this.selectedAnswer.set(null);
    this.answerStatus.set(null);
    this.resetPowerUpVisuals();

    if (this.currentQuestionIndex() < this.questions().length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.endGame();
    }
  }

  usePowerUp(type: 'remove_options' | 'add_time' | 'show_verse'): void {
    if (this.isPaused()) return;
    
    switch(type) {
      case 'remove_options':
        if (this.removeOptionsCount() > 0) {
          this.authService.useConsumable('remove_options');
          const question = this.currentQuestion();
          if (question) {
            const incorrect = question.options.filter(o => o !== question.correctAnswer);
            this.optionsToRemove.set(incorrect.slice(0, 2));
          }
        }
        break;
      case 'add_time':
        if (this.addTimeCount() > 0) {
          this.authService.useConsumable('add_time');
          this.timer.update(t => t + 15);
        }
        break;
      case 'show_verse':
        if (this.showVerseCount() > 0) {
          this.authService.useConsumable('show_verse');
          this.showVerse.set(true);
        }
        break;
    }
  }

  resetPowerUpVisuals() {
    this.showVerse.set(false);
    this.optionsToRemove.set([]);
  }
  
  endGame(): void {
    clearInterval(this.timerInterval);
    this.gameState.set('finished');
    this.isPaused.set(false);
    if (this.challengeMode() === 'normal') {
      this.saveScore(this.score());
    }
  }
  
  private saveScore(score: number): void {
    try {
      localStorage.setItem(this.storageKey, score.toString());
      this.lastScore.set(score);
    } catch (error) {
      console.error('Error saving score to localStorage', error);
    }
  }
  
  async openThinkingMode(): Promise<void> {
    if (this.isPaused()) return;
    const question = this.currentQuestion();
    if (!question) return;

    this.isThinking.set(true);
    this.isThinkingModalOpen.set(true);
    this.thinkingModeContent.set('');
    const response = await this.geminiService.getComplexAnswer(question.category, question.text);
    this.thinkingModeContent.set(response);
    this.isThinking.set(false);
  }
  
  closeThinkingMode(): void {
    this.isThinkingModalOpen.set(false);
  }
  
  goHome(): void {
    if(this.challengeMode() === 'event'){
        this.router.navigate(['/event']);
    } else {
        this.router.navigate(['/main-menu']);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }
}
