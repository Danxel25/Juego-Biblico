import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './main-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent {
  private route = inject(ActivatedRoute);

  private resolvedData = toSignal(this.route.data);
  user = computed(() => (this.resolvedData()?.['user'] as User | null));

  constructor() {}

  get xpPercentage(): number {
    const user = this.user();
    if (!user) return 0;
    // Example: level cap at 1000 XP
    const requiredXp = user.level * 1000;
    return (user.xp / requiredXp) * 100;
  }
}
