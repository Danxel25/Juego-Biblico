import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent {
  authService = inject(AuthService);
  user = this.authService.currentUser;

  constructor(private router: Router) {}

  get xpPercentage(): number {
    const user = this.user();
    if (!user) return 0;
    // Example: level cap at 1000 XP
    const requiredXp = user.level * 1000;
    return (user.xp / requiredXp) * 100;
  }
}
