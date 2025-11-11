import { Injectable } from '@angular/core';
import { supabase } from '../environments/supabase.config';
import { User } from '../models/user.model';

/*
  ===================================================================================
  SCRIPT DE CONFIGURACIÓN DE LA BASE DE DATOS DE SUPABASE
  ===================================================================================
  Para configurar la base de datos, abre el archivo `src/supabase_setup.txt`
  en el editor, copia todo su contenido y ejecútalo en el "SQL Editor"
  de tu proyecto de Supabase.
  ===================================================================================
*/

export interface FriendData {
  friends: User[];
  requests: User[];
}

@Injectable({
  providedIn: 'root',
})
export class DataService {

  private _mapRawUserToUser(data: any): User {
    if (!data) return null as unknown as User;
    return {
        uid: data.uid,
        email: data.email,
        customName: data.custom_name,
        country: data.country,
        gender: data.gender,
        dateOfBirth: data.date_of_birth,
        maritalStatus: data.marital_status,
        avatarUrl: data.avatar_url,
        mottoVerse: data.motto_verse,
        level: data.level,
        xp: data.xp,
        title: data.title,
        fe: data.fe,
        talents: data.talents,
        consumables: data.consumables,
        isGuest: data.is_guest,
        friends: data.friends,
        friendRequestsSent: data.friend_requests_sent,
        friendRequestsReceived: data.friend_requests_received,
        unlockedAchievements: data.unlocked_achievements,
        duelsWon: data.duels_won,
        correctAnswers: data.correct_answers,
        currentStreak: data.current_streak,
        lastLogin: data.last_login
    };
  }

  async getUser(uid: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row expected, but 0 rows returned"
      console.error('Error fetching user:', error.message || error);
      throw error;
    }
    return this._mapRawUserToUser(data);
  }

  async ensureUserProfileExists(uid: string): Promise<void> {
    const { error } = await supabase.rpc('ensure_user_profile_exists', { p_user_id: uid });
    if (error) {
      console.error('Error ensuring user profile exists:', error.message || error);
      throw error;
    }
  }

  async updateUser(uid: string, updates: Partial<User>): Promise<void> {
    // FIX: Manually convert camelCase keys from the app to snake_case keys for the database.
    // This makes the update operation robust and independent of the Supabase client's
    // automatic mapping, which can be unreliable.
    const snakeCaseUpdates = Object.keys(updates).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      (acc as any)[snakeKey] = (updates as any)[key];
      return acc;
    }, {});

    const { error } = await supabase
      .from('users')
      .update(snakeCaseUpdates)
      .eq('uid', uid);
    if (error) {
        console.error("Error updating user:", error.message || error);
        throw error;
    }
  }

  async incrementUserStats(uid: string, stats: { xp?: number; fe?: number; talents?: number; duels_won?: number; correct_answers?: number }): Promise<void> {
    const { error } = await supabase.rpc('increment_user_stats', {
      user_id: uid,
      xp_inc: stats.xp || 0,
      fe_inc: stats.fe || 0,
      talents_inc: stats.talents || 0,
    });
    if (error) {
      console.error('Error incrementing user stats:', error.message || error);
      throw error;
    }

    // Since RPC doesn't support incrementing multiple fields easily in one go for older pg versions,
    // we'll handle duels_won and correct_answers separately if they exist.
    if (stats.duels_won || stats.correct_answers) {
       const { error: statsError } = await supabase.rpc('increment_additional_stats', {
          user_id: uid,
          duels_won_inc: stats.duels_won || 0,
          correct_answers_inc: stats.correct_answers || 0,
      });
      if(statsError) {
          console.error('Error incrementing additional stats:', statsError.message || statsError);
          throw statsError;
      }
    }
  }

  async purchaseConsumable(uid: string, itemId: string, cost: number, currency: 'fe' | 'talents'): Promise<void> {
    const { error } = await supabase.rpc('purchase_consumable', {
      p_user_id: uid,
      p_item_id: itemId,
      p_cost: cost,
      p_currency: currency
    });
    if (error) throw error;
  }

  async useConsumable(uid: string, itemId: string): Promise<void> {
    const { error } = await supabase.rpc('use_consumable', {
      p_user_id: uid,
      p_item_id: itemId
    });
    if (error) throw error;
  }
  
  // --- Friend Methods ---

  async searchUsers(nameQuery: string, currentUserId: string): Promise<User[]> {
    if (!nameQuery.trim()) return [];
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('customName', `%${nameQuery}%`)
      .neq('uid', currentUserId)
      .limit(10);
      
    if (error) {
      console.error("Error searching users:", error.message || error);
      return [];
    }
    return (data || []).map(u => this._mapRawUserToUser(u));
  }

  async getFriendData(userId: string): Promise<FriendData> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const friendIds = user.friends || [];
    const requestIds = user.friendRequestsReceived || [];

    const friends = await this.getUsersByIds(friendIds);
    const requests = await this.getUsersByIds(requestIds);

    return { friends, requests };
  }
  
  private async getUsersByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('uid', ids);

    if (error) {
        console.error("Error fetching users by IDs:", error.message || error);
        return [];
    }
    return (data || []).map(u => this._mapRawUserToUser(u));
  }

  async sendFriendRequest(currentUserId: string, targetUserId: string): Promise<void> {
    const { error } = await supabase.rpc('send_friend_request', { sender_id: currentUserId, receiver_id: targetUserId });
    if (error) throw error;
  }

  async acceptFriendRequest(currentUserId: string, requestingUserId: string): Promise<void> {
    const { error } = await supabase.rpc('accept_friend_request', { accepter_id: currentUserId, requester_id: requestingUserId });
    if (error) throw error;
  }

  async declineFriendRequest(currentUserId: string, requestingUserId: string): Promise<void> {
    const { error } = await supabase.rpc('decline_friend_request', { decliner_id: currentUserId, requester_id: requestingUserId });
    if (error) throw error;
  }

  async removeFriend(currentUserId: string, friendId: string): Promise<void> {
    const { error } = await supabase.rpc('remove_friend', { remover_id: currentUserId, friend_to_remove_id: friendId });
    if (error) throw error;
  }

  async updateLoginStreak(userId: string): Promise<void> {
    const { error } = await supabase.rpc('update_login_streak', { p_user_id: userId });
    if (error) {
      console.error("Error updating login streak:", error.message || error);
      throw error;
    }
  }

  async getLeaderboard(sortBy: string): Promise<User[]> {
    const { data, error } = await supabase.rpc('get_leaderboard', { sort_by: sortBy });
    if (error) {
      console.error(`Error fetching leaderboard for ${sortBy}:`, error.message || error);
      throw error;
    }

    // RPC returns a different shape, we need to map it correctly.
    // Specifically, array_length is returned as a count.
    return (data || []).map((u: any) => ({
      ...this._mapRawUserToUser(u),
      unlockedAchievements: { length: u.unlocked_achievements_count || 0 }
    }));
  }
}
