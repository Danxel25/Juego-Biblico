import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommunityPost } from '../../models/community.model';
import { CommunityService } from '../../services/community.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Announcement } from '../../models/announcement.model';
import { AnnouncementService } from '../../services/announcement.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './community.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityComponent implements OnInit {
  private communityService = inject(CommunityService);
  private authService = inject(AuthService);
  private announcementService = inject(AnnouncementService);
  private soundService = inject(SoundService);

  user = this.authService.currentUser;
  
  // Forum State
  communityPosts = signal<CommunityPost[]>([]);
  private readonly pageSize = 5;
  private totalPosts = signal(0);
  isLoadingPosts = signal(false);

  showNewTopicForm = signal(false);
  newTopicTitle = signal('');
  newTopicContent = signal('');
  replyingToPostId = signal<string | null>(null);
  replyContent = signal('');
  
  // Announcements
  announcements = this.announcementService.announcements;
  
  // General State
  notification = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  // Computed values
  hasMorePosts = computed(() => this.communityPosts().length < this.totalPosts());

  constructor() {}

  ngOnInit(): void {
    this.loadInitialPosts();
  }

  async loadInitialPosts(): Promise<void> {
    this.isLoadingPosts.set(true);
    try {
      const [posts, count] = await Promise.all([
        this.communityService.getPosts(1, this.pageSize),
        this.communityService.getPostsCount(),
      ]);
      this.communityPosts.set(posts);
      this.totalPosts.set(count);
    } catch (error) {
      console.error("Error fetching community posts:", (error as Error).message || error);
      this.showNotification('No se pudieron cargar las publicaciones del foro.', 'error');
    } finally {
      this.isLoadingPosts.set(false);
    }
  }

  async loadMorePosts(): Promise<void> {
    if (this.isLoadingPosts() || !this.hasMorePosts()) return;
    
    this.isLoadingPosts.set(true);
    try {
      const currentPage = Math.floor(this.communityPosts().length / this.pageSize);
      const nextPage = currentPage + 1;
      const newPosts = await this.communityService.getPosts(nextPage, this.pageSize);
      this.communityPosts.update(currentPosts => [...currentPosts, ...newPosts]);
    } catch (error) {
       console.error("Error fetching more posts:", (error as Error).message || error);
       this.showNotification('Error al cargar más publicaciones.', 'error');
    } finally {
      this.isLoadingPosts.set(false);
    }
  }

  onNewTopicTitleChange(event: Event): void {
    this.newTopicTitle.set((event.target as HTMLInputElement).value);
  }

  onNewTopicContentChange(event: Event): void {
    this.newTopicContent.set((event.target as HTMLTextAreaElement).value);
  }

  onReplyContentChange(event: Event): void {
    this.replyContent.set((event.target as HTMLTextAreaElement).value);
  }
  
  // --- Forum Methods ---

  toggleNewTopicForm(): void {
    this.showNewTopicForm.update(v => !v);
    this.replyingToPostId.set(null); // Close reply form if open
  }

  async submitNewTopic(): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !this.newTopicTitle().trim() || !this.newTopicContent().trim()) {
      this.showNotification('El título y el contenido no pueden estar vacíos.', 'error');
      return;
    }

    try {
      await this.communityService.addPost(this.newTopicTitle(), this.newTopicContent(), currentUser);
      
      await this.authService.incrementUserStats({ talents: 5 });

      this.showNotification('¡Tema creado con éxito! Has ganado 5 Talentos.', 'success');
      this.newTopicTitle.set('');
      this.newTopicContent.set('');
      this.showNewTopicForm.set(false);
      this.loadInitialPosts();
    } catch (error) {
      console.error("Error creating new topic:", (error as Error).message || error);
      this.showNotification('Hubo un error al crear el tema.', 'error');
    }
  }

  toggleReplyForm(postId: string): void {
    if (this.replyingToPostId() === postId) {
      this.replyingToPostId.set(null);
    } else {
      this.replyingToPostId.set(postId);
      this.showNewTopicForm.set(false);
      this.replyContent.set('');
    }
  }

  async submitReply(postId: string): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !this.replyContent().trim()) {
      this.showNotification('La respuesta no puede estar vacía.', 'error');
      return;
    }

    try {
      await this.communityService.addReply(postId, this.replyContent(), currentUser);
      
      await this.authService.incrementUserStats({ fe: 15 });

      this.showNotification('¡Respuesta añadida! Has ganado 15 de Fe.', 'success');
      this.replyingToPostId.set(null);
      this.replyContent.set('');
      this.loadInitialPosts();
    } catch (error) {
      console.error("Error submitting reply:", (error as Error).message || error);
      this.showNotification('Hubo un error al enviar la respuesta.', 'error');
    }
  }

  hasUserLiked(post: CommunityPost): boolean {
    const currentUser = this.user();
    if (!currentUser) return false;
    return post.liked_by?.includes(currentUser.uid) ?? false;
  }

  async likePost(post: CommunityPost): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !post.id || this.hasUserLiked(post)) {
      return;
    }
    
    try {
      await this.communityService.likePost(post.id, currentUser.uid);
      if (post.author.uid !== currentUser.uid) {
        await this.communityService.rewardUserForLike(post.author.uid);
      }

      this.communityPosts.update(posts => 
        posts.map(p => 
          p.id === post.id 
            ? { ...p, likes: (p.likes || 0) + 1, liked_by: [...(p.liked_by || []), currentUser.uid] }
            : p
        )
      );
      
    } catch (error) {
      console.error("Error liking post:", (error as Error).message || error);
      this.showNotification('No se pudo registrar el "Me gusta".', 'error');
    }
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notification.set({ message, type });
    if (type === 'success') {
      this.soundService.playSound('notification');
    }
    setTimeout(() => this.notification.set(null), 4000);
  }
}
