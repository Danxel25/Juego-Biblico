import { Injectable, inject } from '@angular/core';
// FIX: Corrected import paths to be relative to this file's directory.
import { supabase } from '../../environments/supabase.config';
import { CommunityPost, PostReply } from '../../models/community.model';
import { User } from '../../models/user.model';
import { DataService } from '../../services/data.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private dataService = inject(DataService);

  async getPosts(): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching community posts:", error);
      throw error;
    }
    return data as CommunityPost[];
  }

  async addPost(title: string, content: string, user: User): Promise<void> {
    const newPost: Omit<CommunityPost, 'id'> = {
      author: {
        uid: user.uid,
        customName: user.customName,
        avatarUrl: user.avatarUrl,
      },
      title,
      content,
      created_at: new Date().toISOString(),
      replies: [],
      likes: 0,
      liked_by: [],
    };
    const { error } = await supabase.from('community_posts').insert(newPost);
    if (error) throw error;
  }

  async addReply(postId: string, content: string, user: User): Promise<void> {
    // NOTA: La función RPC 'add_reply_to_post' se crea en el script de configuración
    // principal que se encuentra en 'src/services/data.service.ts'.
    const newReply: PostReply = {
      id: uuidv4(), // Generate a unique ID for the reply
      author: {
        uid: user.uid,
        customName: user.customName,
        avatarUrl: user.avatarUrl,
      },
      content,
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.rpc('add_reply_to_post', { 
      p_post_id: postId, 
      p_new_reply: newReply 
    });
    if (error) throw error;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    // NOTA: La función RPC 'like_community_post' se crea en el script de configuración
    // principal que se encuentra en 'src/services/data.service.ts'.
    const { error } = await supabase.rpc('like_community_post', {
      p_post_id: postId,
      p_user_id: userId,
    });
    if (error) throw error;
  }

  async rewardUserForLike(authorId: string): Promise<void> {
    await this.dataService.incrementUserStats(authorId, { fe: 5 });
  }
}
