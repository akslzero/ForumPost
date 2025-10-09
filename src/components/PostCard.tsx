import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { postsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Post {
  _id: string;
  content: string;
  image?: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  category?: {
    _id: string;
    name: string;
    color: string;
  };
  likes: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
  onCommentClick: () => void;
}

const PostCard = ({ post, onUpdate, onCommentClick }: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.id || ''));
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: 'Login diperlukan',
        description: 'Silakan login untuk like post',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await postsAPI.toggleLike(post._id);
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      toast({
        title: 'Gagal like post',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus post ini?')) return;

    try {
      await postsAPI.delete(post._id);
      toast({
        title: 'Post berhasil dihapus',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Gagal menghapus post',
        variant: 'destructive',
      });
    }
  };

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex gap-3">
        <Avatar>
          <AvatarFallback>{post.author.displayName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">{post.author.displayName}</p>
              <p className="text-sm text-muted-foreground">
                @{post.author.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: id })}
              </p>
            </div>
            {user?.id === post.author._id && (
              <Button variant="ghost" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          {post.category && (
            <Badge style={{ backgroundColor: post.category.color }}>
              {post.category.name}
            </Badge>
          )}

          <p className="whitespace-pre-wrap">{post.content}</p>

          {post.image && (
            <img
              src={`${API_BASE}${post.image}`}
              alt="Post"
              className="rounded-lg max-h-96 w-full object-cover"
            />
          )}

          <div className="flex items-center gap-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={isLiked ? 'text-red-500' : ''}
            >
              <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </Button>

            <Button variant="ghost" size="sm" onClick={onCommentClick}>
              <MessageCircle className="mr-1 h-4 w-4" />
              {post.commentsCount}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
