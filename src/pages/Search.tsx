import { useState } from 'react';
import { postsAPI } from '@/services/api';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

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

const Search = () => {
  const [query, setQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await postsAPI.getAll({ search: query });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container max-w-2xl py-6 space-y-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Cari post..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
          </Button>
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onUpdate={() => handleSearch(new Event('submit') as any)}
                onCommentClick={() => {}}
              />
            ))}

            {searched && posts.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                Tidak ada hasil untuk "{query}"
              </p>
            )}

            {!searched && (
              <p className="text-center text-muted-foreground py-12">
                Masukkan kata kunci untuk mencari post
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
