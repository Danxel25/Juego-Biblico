import { Component, ChangeDetectionStrategy, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { AuthService } from '../../services/auth.service';
import { BibleChapter, ChapterActivity } from '../../models/campaign.model';
import { SoundService } from '../../services/sound.service';

type GameState = 'loading' | 'playing' | 'finished';

@Component({
  selector: 'app-campaign-level',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campaign-level.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignLevelComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private soundService = inject(SoundService);

  // State
  bookId = signal<string | null>(null);
  chapter = signal<BibleChapter | null>(null);
  gameState = signal<GameState>('loading');
  
  currentActivityIndex = signal(0);
  
  // Interaction State
  selectedAnswer = signal<string | null>(null);
  answerStatus = signal<'correct' | 'incorrect' | null>(null);

  currentActivity = computed<ChapterActivity | null>(() => {
    const chap = this.chapter();
    if (!chap) return null;
    return chap.activities[this.currentActivityIndex()];
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const bookId = params.get('bookId');
      const chapterId = Number(params.get('chapterId'));
      
      if (bookId && chapterId) {
        this.bookId.set(bookId);
        const chapterData = this.campaignService.getChapterById(bookId, chapterId);
        if (chapterData) {
          this.chapter.set(chapterData);
          this.startGame();
        } else {
          this.router.navigate(['/campaign']);
        }
      }
    });
  }

  startGame(): void {
    if (!this.chapter() || this.chapter()!.activities.length === 0) {
      this.gameState.set('finished'); // No activities, consider it finished
      return;
    }
    this.currentActivityIndex.set(0);
    this.selectedAnswer.set(null);
    this.answerStatus.set(null);
    this.gameState.set('playing');
  }

  selectAnswer(option: string): void {
    if (this.selectedAnswer()) return;

    this.selectedAnswer.set(option);
    const activity = this.currentActivity();
    if (!activity) return;

    const isCorrect = option === activity.correctAnswer;
    this.answerStatus.set(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      this.soundService.playSound('correct');
      this.authService.incrementUserStats({ xp: 10, fe: 2 });
    } else {
      this.soundService.playSound('incorrect');
    }

    setTimeout(() => this.nextActivity(), 2500); // Wait 2.5s to see feedback
  }

  nextActivity(): void {
    // Save progress
    const activity = this.currentActivity();
    const chap = this.chapter();
    const book = this.bookId();
    if (activity && chap && book && this.answerStatus() === 'correct') {
      this.campaignService.completeActivity(book, chap.id, activity.id);
    }
    
    // Reset for next round
    this.selectedAnswer.set(null);
    this.answerStatus.set(null);
    
    // Move to next activity or finish
    if (this.currentActivityIndex() < this.chapter()!.activities.length - 1) {
      this.currentActivityIndex.update(i => i + 1);
    } else {
      this.gameState.set('finished');
      this.soundService.playSound('level_complete');
      // Give bonus for completing chapter
      this.authService.incrementUserStats({ xp: 50, fe: 15 });
    }
  }
}
