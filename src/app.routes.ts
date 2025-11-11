import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { QuickChallengeComponent } from './components/quick-challenge/quick-challenge.component';
import { authGuard } from './guards/auth.guard';
import { CampaignComponent } from './components/campaign/campaign.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DuelComponent } from './components/duel/duel.component';
import { StoreComponent } from './components/store/store.component';
import { SettingsComponent } from './components/settings/settings.component';
import { CommunityComponent } from './components/community/community.component';
import { EventComponent } from './components/event/event.component';
import { CampaignLevelComponent } from './components/campaign-level/campaign-level.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';

export const APP_ROUTES: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'main-menu', component: MainMenuComponent, canActivate: [authGuard] },
  { path: 'quick-challenge', component: QuickChallengeComponent, canActivate: [authGuard] },
  { path: 'campaign', component: CampaignComponent, canActivate: [authGuard] },
  { path: 'campaign/book/:bookId/chapter/:chapterId', component: CampaignLevelComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'duel', component: DuelComponent, canActivate: [authGuard] },
  { path: 'community', component: CommunityComponent, canActivate: [authGuard] },
  { path: 'store', component: StoreComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'event', component: EventComponent, canActivate: [authGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'main-menu', pathMatch: 'full' },
  { path: '**', redirectTo: 'main-menu' },
];
