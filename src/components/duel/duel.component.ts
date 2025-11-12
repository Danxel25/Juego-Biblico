import { Component, ChangeDetectionStrategy, inject, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DuelService } from '../../services/duel.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-duel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './duel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuelComponent implements OnDestroy {
  duelService = inject(DuelService);
  authService = inject(AuthService);
  router = inject(Router);

  // Expose service signals to the template
  gameState = this.duelService.gameState;
  player = this.duelService.player;
  opponent = this.duelService.opponent;
  currentQuestion = this.duelService.currentQuestion;
  roundTimer = this.duelService.roundTimer;
  playerScore = this.duelService.playerScore;
  opponentScore = this.duelService.opponentScore;
  selectedAnswer = this.duelService.selectedAnswer;
  answerStatus = this.duelService.answerStatus;
  winner = this.duelService.winner;
  showVsScreen = this.duelService.showVsScreen;

  constructor() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.duelService.initPlayer(currentUser);
    } else {
      // Should be protected by auth guard, but as a fallback
      this.router.navigate(['/main-menu']);
    }
  }

  findMatch(): void {
    this.duelService.startMatchmaking();
  }

  selectAnswer(answer: string): void {
    this.duelService.answerQuestion(answer);
  }

  playAgain(): void {
    this.duelService.reset();
    this.findMatch();
  }

  goHome(): void {
    this.router.navigate(['/main-menu']);
  }

  ngOnDestroy(): void {
    // Reset the service state when the user navigates away
    this.duelService.reset();
  }
}