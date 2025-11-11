import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { BibleChapter } from '../../models/campaign.model';

@Component({
  selector: 'app-campaign',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './campaign.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignComponent {
  private campaignService = inject(CampaignService);

  genesisBook = this.campaignService.genesisBook;
  progress = this.campaignService.progress;

  private allChapters = computed(() => 
    this.genesisBook().stages.flatMap(s => s.chapters)
  );

  getCompletedActivitiesCount(chapter: BibleChapter): number {
    const bookId = this.genesisBook().id;
    return (this.progress().completedActivities[bookId]?.[chapter.id] || []).length;
  }

  getTotalActivitiesCount(chapter: BibleChapter): number {
    return chapter.activities.length;
  }

  getChapterProgress(chapter: BibleChapter): number {
    const total = this.getTotalActivitiesCount(chapter);
    if (total === 0) {
      return 100;
    }
    const completed = this.getCompletedActivitiesCount(chapter);
    return (completed / total) * 100;
  }
  
  isChapterCompleted(chapter: BibleChapter): boolean {
    const total = this.getTotalActivitiesCount(chapter);
    // A chapter with no activities is considered complete by default to allow progression.
    if (total === 0) return true; 
    
    const completed = this.getCompletedActivitiesCount(chapter);
    return completed >= total;
  }

  isChapterUnlocked(chapterId: number): boolean {
    const all = this.allChapters();
    const chapterIndex = all.findIndex(c => c.id === chapterId);

    if (chapterIndex === 0) return true; // First chapter is always unlocked
    if (chapterIndex < 0) return false;

    const previousChapter = all[chapterIndex - 1];
    return this.isChapterCompleted(previousChapter);
  }
}
