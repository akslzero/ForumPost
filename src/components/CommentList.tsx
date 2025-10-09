import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Trash2 } from 'lucide-react';
import { commentsAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
  };
  createdAt: string;
}

interface CommentListProps {
  postId: string;
}

const CommentList = ({ postId }: CommentListProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const response = await commentsAPI.getAll(postId);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      await commentsAPI.create(postId, { content: newComment });
      setNewComment('');
      loadComments();
      toast({
        title: 'Komentar berhasil ditambahkan',
      });
    } catch (error) {
      toast({
        title: 'Gagal menambahkan komentar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;

    try {
      await commentsAPI.delete(commentId);
      loadComments();
      toast({
        title: 'Komentar berhasil dihapus',
      });
    } catch (error) {
      toast({
        title: 'Gagal menghapus komentar',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {user && (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Tulis komentar..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={300}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {newComment.length}/300
              </span>
              <Button type="submit" size="sm" disabled={loading || !newComment.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Kirim
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {comments.map((comment) => (
          <Card key={comment._id} className="p-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {comment.author.displayName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{comment.author.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: id })}
                    </p>
                  </div>
                  {user?.id === comment.author._id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDelete(comment._id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          </Card>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Belum ada komentar
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentList;
