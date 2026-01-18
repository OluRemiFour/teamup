import { useState, useEffect } from 'react';
import { ExternalLink, TrendingUp, Clock, Newspaper, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockNewsArticles } from '@/data/mockOpenSource';
import { NewsArticle } from '@/types/project';

interface TechPulseWidgetProps {
  maxItems?: number;
  showImage?: boolean;
  compact?: boolean;
}

export function TechPulseWidget({ maxItems = 5, showImage = true, compact = false }: TechPulseWidgetProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setArticles(mockNewsArticles.slice(0, maxItems));
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [maxItems]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Shuffle articles to simulate refresh
    setArticles(prev => [...prev].sort(() => Math.random() - 0.5));
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-display font-bold text-white">Tech Pulse</h3>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="glass-panel rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-display font-bold text-white">Tech Pulse</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-6 h-6 text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="space-y-2">
          {articles.slice(0, 3).map((article, index) => (
            <a
              key={index}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-gray-300 hover:text-cyan-400 transition-colors font-sans truncate"
            >
              {article.title}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-display font-bold text-white">Tech Pulse</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
            style={{
              animation: `scale-in 0.3s ease-out ${index * 0.05}s both`,
            }}
          >
            <div className="flex gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
              {showImage && article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-sans font-medium text-white text-sm mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-400 font-sans line-clamp-2 mb-2">
                  {article.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Newspaper className="w-3 h-3" />
                    {article.source.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(article.publishedAt)}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>

      <Button
        variant="ghost"
        className="w-full mt-4 text-cyan-400 hover:text-cyan-300 font-sans"
      >
        View all news
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
