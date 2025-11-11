import { User } from './user.model';

export interface PostReply {
  id: string;
  author: {
    uid: string;
    customName: string;
    avatarUrl: string;
  };
  content: string;
  created_at: string;
}

export interface CommunityPost {
  id?: string;
  author: {
    uid: string;
    customName: string;
    avatarUrl: string;
  };
  title: string;
  content: string;
  created_at: string;
  replies: PostReply[];
  likes?: number;
  liked_by?: string[];
}
