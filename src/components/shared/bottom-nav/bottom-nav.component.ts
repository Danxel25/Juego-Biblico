import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  lastClicked = signal<string | null>(null);

  onNavClick(path: string): void {
    this.lastClicked.set(path);
    setTimeout(() => {
        if (this.lastClicked() === path) {
            this.lastClicked.set(null);
        }
    }, 600); // Match animation duration
  }
}