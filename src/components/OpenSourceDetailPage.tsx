import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  GitFork,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Clock,
  Tag,
  Sparkles,
  BookOpen,
  Users,
  GitPullRequest,
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '@/components/ui/button';
import { MatchScoreRing } from './MatchScoreRing';
import { mockOpenSourceRepos, mockGitHubIssues } from '@/data/mockOpenSource';
import { GitHubRepo, GitHubIssue } from '@/types/project';
import { Badge } from '@/components/ui/badge';

export function OpenSourceDetailPage() {
  const { repoName } = useParams<{ repoName: string }>();
  const navigate = useNavigate();
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const decodedName = decodeURIComponent(repoName || '');
      const found = mockOpenSourceRepos.find(r => r.full_name === decodedName);
      setRepo(found || null);
      setIssues(mockGitHubIssues[decodedName] || []);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [repoName]);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'intermediate': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (selectedDifficulty && issue.difficulty !== selectedDifficulty) return false;
    if (selectedLabel && !issue.labels.some(l => l.name === selectedLabel)) return false;
    return true;
  });

  const allLabels = [...new Set(issues.flatMap(i => i.labels.map(l => l.name)))];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 font-sans">Loading repository...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!repo) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Repository Not Found</h2>
            <p className="text-gray-400 font-sans mb-6">The repository you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/dashboard/open-source')} className="bg-gradient-to-r from-cyan-500 to-purple-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Open Source
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-sans"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to open source
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="glass-panel rounded-xl p-8 gradient-border">
            <div className="flex items-start gap-6">
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="w-20 h-20 rounded-xl"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-400 font-mono mb-1">{repo.owner.login}</p>
                    <h1 className="text-3xl font-display font-bold text-white">
                      {repo.name}
                    </h1>
                  </div>
                  {repo.matchScore && (
                    <MatchScoreRing score={repo.matchScore} size={80} />
                  )}
                </div>

                <p className="text-gray-300 font-sans leading-relaxed mb-4">
                  {repo.description}
                </p>

                <div className="flex items-center gap-6 text-sm font-mono mb-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Star className="w-4 h-4" />
                    <span>{formatNumber(repo.stargazers_count)} stars</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <GitFork className="w-4 h-4" />
                    <span>{formatNumber(repo.forks_count)} forks</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{formatNumber(repo.open_issues_count)} issues</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {repo.topics.map(topic => (
                    <span
                      key={topic}
                      className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs text-purple-400 font-mono"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on GitHub
                    </Button>
                  </a>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Read Docs
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Match Reasoning */}
          {repo.matchReasons && (
            <div className="glass-panel rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-display font-bold text-white">Why This Matches You</h2>
              </div>
              <div className="space-y-3">
                {repo.matchReasons.map((reason, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                  >
                    {reason.type === 'strength' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`font-sans ${reason.type === 'strength' ? 'text-gray-200' : 'text-gray-400'}`}>
                      {reason.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues Section */}
          <div className="glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-white">Good First Issues</h2>
              <span className="text-sm text-gray-400 font-mono">{filteredIssues.length} issues</span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-sans">Difficulty:</span>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                      className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                        selectedDifficulty === diff
                          ? getDifficultyColor(diff)
                          : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-sans">Label:</span>
                <div className="flex gap-2 flex-wrap">
                  {allLabels.slice(0, 4).map(label => (
                    <button
                      key={label}
                      onClick={() => setSelectedLabel(selectedLabel === label ? null : label)}
                      className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                        selectedLabel === label
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue, index) => (
                  <a
                    key={issue.id}
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-cyan-500/30"
                    style={{
                      animation: `scale-in 0.3s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500 font-mono">#{issue.number}</span>
                          {issue.difficulty && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${getDifficultyColor(issue.difficulty)}`}>
                              {issue.difficulty}
                            </span>
                          )}
                        </div>
                        <h3 className="font-sans font-medium text-white mb-2 hover:text-cyan-400 transition-colors">
                          {issue.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {issue.labels.map(label => (
                            <span
                              key={label.name}
                              className="px-2 py-0.5 rounded-full text-xs font-mono"
                              style={{
                                backgroundColor: `#${label.color}20`,
                                color: `#${label.color}`,
                                borderColor: `#${label.color}50`,
                                borderWidth: 1,
                              }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(issue.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{issue.comments} comments</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    </div>
                  </a>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 font-sans">No issues match your filters</p>
                  <button
                    onClick={() => {
                      setSelectedDifficulty(null);
                      setSelectedLabel(null);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-sans mt-2"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="glass-panel rounded-xl p-6 gradient-border">
            <h3 className="text-lg font-display font-bold text-white mb-4">Repository Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-sans text-sm">Language</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-mono text-sm">
                  {repo.language}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-sans text-sm">Stars</span>
                <span className="text-amber-400 font-mono text-sm">{formatNumber(repo.stargazers_count)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-sans text-sm">Forks</span>
                <span className="text-gray-300 font-mono text-sm">{formatNumber(repo.forks_count)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-sans text-sm">Open Issues</span>
                <span className="text-gray-300 font-mono text-sm">{formatNumber(repo.open_issues_count)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-sans text-sm">Last Updated</span>
                <span className="text-gray-300 font-mono text-sm">{formatDate(repo.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Contribution Tips */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-display font-bold text-white mb-4">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-cyan-400 font-bold">1</span>
                </div>
                <p className="text-sm text-gray-400 font-sans">Fork the repository to your account</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-cyan-400 font-bold">2</span>
                </div>
                <p className="text-sm text-gray-400 font-sans">Read the CONTRIBUTING.md guidelines</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-cyan-400 font-bold">3</span>
                </div>
                <p className="text-sm text-gray-400 font-sans">Pick an issue and comment to claim it</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-cyan-400 font-bold">4</span>
                </div>
                <p className="text-sm text-gray-400 font-sans">Submit a pull request with your changes</p>
              </div>
            </div>
          </div>

          {/* Similar Repos */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-display font-bold text-white mb-4">Similar Projects</h3>
            <div className="space-y-3">
              {mockOpenSourceRepos
                .filter(r => r.full_name !== repo.full_name)
                .slice(0, 3)
                .map(r => (
                  <a
                    key={r.id}
                    href={`/dashboard/open-source/${encodeURIComponent(r.full_name)}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <img src={r.owner.avatar_url} alt={r.owner.login} className="w-8 h-8 rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-medium text-white text-sm truncate">{r.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{formatNumber(r.stargazers_count)} stars</p>
                    </div>
                    {r.matchScore && (
                      <span className="text-xs text-cyan-400 font-mono">{r.matchScore}%</span>
                    )}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
