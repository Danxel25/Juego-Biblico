import { Component, ChangeDetectionStrategy, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommunityPost } from '../../models/community.model';
import { CommunityService } from '../../services/community.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Announcement } from '../../models/announcement.model';
import { AnnouncementService } from '../../services/announcement.service';
import { DataService } from '../../services/data.service';
import { debounceTime, Subject } from 'rxjs';

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
  private dataService = inject(DataService);

  user = this.authService.currentUser;
  
  // Forum State
  communityPosts = signal<CommunityPost[]>([]);
  showNewTopicForm = signal(false);
  newTopicTitle = signal('');
  newTopicContent = signal('');
  replyingToPostId = signal<string | null>(null);
  replyContent = signal('');
  
  // Announcements
  announcements = this.announcementService.announcements;

  // Friends State
  activeTab = signal<'forum' | 'friends'>('forum');
  friends = signal<User[]>([]);
  incomingRequests = signal<User[]>([]);
  searchResults = signal<User[]>([]);
  searchQuery = signal('');
  private searchSubject = new Subject<string>();
  
  // General State
  notification = signal<{ message: string; type: 'success' | 'error' } | null>(null);

  // Computed values for friend search status
  friendIds = computed(() => new Set(this.friends().map(f => f.uid)));
  requestIds = computed(() => new Set(this.incomingRequests().map(r => r.uid)));
  sentRequestIds = computed(() => new Set(this.user()?.friendRequestsSent || []));

  constructor() {
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    this.loadPosts();
    this.loadFriendData();
  }

  async loadPosts(): Promise<void> {
    try {
      const posts = await this.communityService.getPosts();
      this.communityPosts.set(posts);
    } catch (error) {
      console.error("Error fetching community posts:", (error as Error).message || error);
      this.showNotification('No se pudieron cargar las publicaciones del foro.', 'error');
    }
  }

  async loadFriendData(): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    try {
      const friendData = await this.dataService.getFriendData(currentUser.uid);
      this.friends.set(friendData.friends);
      this.incomingRequests.set(friendData.requests);
    } catch (error) {
      console.error("Error fetching friend data:", (error as Error).message || error);
      this.showNotification('No se pudieron cargar los datos de amigos.', 'error');
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
  
  onSearchQueryChanged(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  async performSearch(query: string): Promise<void> {
    const currentUser = this.user();
    if (!currentUser || !query.trim()) {
      this.searchResults.set([]);
      return;
    }
    try {
      const results = await this.dataService.searchUsers(query, currentUser.uid);
      this.searchResults.set(results);
    } catch (error) {
      console.error("Error searching users:", (error as Error).message || error);
      this.showNotification('Error al buscar usuarios.', 'error');
    }
  }

  async sendFriendRequest(targetUser: User): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    try {
      await this.dataService.sendFriendRequest(currentUser.uid, targetUser.uid);
      // Optimistically update the UI
      this.authService.currentUser.update(u => {
        if (!u) return null;
        return {
          ...u,
          friendRequestsSent: [...(u.friendRequestsSent || []), targetUser.uid]
        };
      });
      this.showNotification(`Solicitud enviada a ${targetUser.customName}`, 'success');
    } catch (error) {
      console.error("Error sending friend request:", (error as Error).message || error);
      this.showNotification('No se pudo enviar la solicitud.', 'error');
    }
  }

  async acceptFriendRequest(requestingUser: User): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    try {
      await this.dataService.acceptFriendRequest(currentUser.uid, requestingUser.uid);
      // Update UI
      this.friends.update(friends => [...friends, requestingUser]);
      this.incomingRequests.update(reqs => reqs.filter(r => r.uid !== requestingUser.uid));
      this.showNotification(`Ahora eres amigo de ${requestingUser.customName}.`, 'success');
    } catch (error) {
      console.error("Error accepting friend request:", (error as Error).message || error);
      this.showNotification('No se pudo aceptar la solicitud.', 'error');
    }
  }

  async declineFriendRequest(requestingUser: User): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    try {
      await this.dataService.declineFriendRequest(currentUser.uid, requestingUser.uid);
      this.incomingRequests.update(reqs => reqs.filter(r => r.uid !== requestingUser.uid));
      this.showNotification(`Solicitud de ${requestingUser.customName} rechazada.`, 'success');
    } catch (error) {
      console.error("Error declining friend request:", (error as Error).message || error);
      this.showNotification('No se pudo rechazar la solicitud.', 'error');
    }
  }
  
  async removeFriend(friend: User): Promise<void> {
      const currentUser = this.user();
      if (!currentUser) return;
      try {
        await this.dataService.removeFriend(currentUser.uid, friend.uid);
        this.friends.update(friends => friends.filter(f => f.uid !== friend.uid));
        this.showNotification(`${friend.customName} ha sido eliminado de tus amigos.`, 'success');
      } catch (error) {
        console.error("Error removing friend:", (error as Error).message || error);
        this.showNotification('No se pudo eliminar al amigo.', 'error');
      }
  }

  getUserStatus(targetUser: User): 'friend' | 'request_sent' | 'none' {
    if (this.friendIds().has(targetUser.uid)) return 'friend';
    if (this.sentRequestIds().has(targetUser.uid)) return 'request_sent';
    return 'none';
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
      this.loadPosts();
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
      this.loadPosts();
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
    setTimeout(() => this.notification.set(null), 4000);
  }
}
