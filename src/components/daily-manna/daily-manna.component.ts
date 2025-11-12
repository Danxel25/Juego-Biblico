import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyMannaService } from '../../services/daily-manna.service';

@Component({
  selector: 'app-daily-manna',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './daily-manna.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyMannaComponent {
  dailyMannaService = inject(DailyMannaService);

  mannaData = this.dailyMannaService.mannaData;

  closeManna(): void {
    this.dailyMannaService.markMannaAsRead();
  }
}
