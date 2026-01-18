import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  GitFork,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MatchScoreRing } from './MatchScoreRing';
import { mockOpenSourceRepos } from '@/data/mockOpenSource';
import { GitHubRepo } from '@/types/project';

export function OpenSourcePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'stars' | 'recent'>('match');

  const languages = [...new Set(mockOpenSourceRepos.map(r => r.language).filter(Boolean))];

  const filteredRepos = useMemo(() => {
    let repos = [...mockOpenSourceRepos];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      repos = repos.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.topics.some(t => t.toLowerCase().includes(query))
      );
    }

    if (selectedLanguage) {
      repos = repos.filter(r => r.language === selectedLanguage);
    }

    switch (sortBy) {
      case 'match':
        repos.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'stars':
        repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
        break;
      case 'recent':
        repos.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
    }

    return repos;
  }, [searchQuery, selectedLanguage, sortBy]);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-display font-bold text-white">Open Source</h1>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 font-mono">
            AI Matched
          </span>
        </div>
        <p className="text-gray-400 font-sans">
          Discover open source projects that match your skills and interests
        </p>
      </div>

      {/* Search & Filters */}
      <div className="glass-panel rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-sans">Language:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLanguage(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all ${
                  !selectedLanguage
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                }`}
              >
                All
              </button>
              {languages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(selectedLanguage === lang ? null : lang)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all ${
                    selectedLanguage === lang
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 font-sans">Sort:</span>
            <div className="flex gap-2">
              {[
                { value: 'match', label: 'Best Match', icon: Sparkles },
                { value: 'stars', label: 'Stars', icon: Star },
                { value: 'recent', label: 'Recent', icon: TrendingUp },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all flex items-center gap-1.5 ${
                    sortBy === option.value
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                  }`}
                >
                  <option.icon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 font-sans">
          {filteredRepos.length} repositories found
        </p>
      </div>

      {/* Repository Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredRepos.map((repo, index) => (
          <Link
            key={repo.id}
            to={`/dashboard/open-source/${encodeURIComponent(repo.full_name)}`}
            className="glass-panel rounded-xl p-6 gradient-border hover:translate-y-[-4px] transition-all duration-300 group"
            style={{
              animation: `stagger-fade-in 0.5s ease-out ${index * 0.05}s both`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={repo.owner.avatar_url}
                  alt={repo.owner.login}
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <p className="text-sm text-gray-400 font-mono">{repo.owner.login}</p>
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-cyan-400 transition-colors">
                    {repo.name}
                  </h3>
                </div>
              </div>
              {repo.matchScore && (
                <MatchScoreRing score={repo.matchScore} size={60} />
              )}
            </div>

            <p className="text-gray-400 font-sans text-sm mb-4 line-clamp-2">
              {repo.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-400 font-mono mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400" />
                <span>{formatNumber(repo.stargazers_count)}</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                <span>{formatNumber(repo.forks_count)}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{formatNumber(repo.open_issues_count)} issues</span>
              </div>
              {repo.language && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  {repo.language}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {repo.topics.slice(0, 4).map(topic => (
                <span
                  key={topic}
                  className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs text-purple-400 font-mono"
                >
                  {topic}
                </span>
              ))}
              {repo.topics.length > 4 && (
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">
                  +{repo.topics.length - 4}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredRepos.length === 0 && (
        <div className="glass-panel rounded-xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-display font-bold text-white mb-2">No repositories found</h3>
          <p className="text-gray-400 font-sans mb-4">
            Try adjusting your search or filters
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedLanguage(null);
            }}
            className="border-white/20 text-white hover:bg-white/5"
          >
            Clear filters
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
