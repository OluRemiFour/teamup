import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  GitFork,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchScoreRing } from "./MatchScoreRing";
import { mockOpenSourceRepos } from "@/data/mockOpenSource";
import { GitHubRepo } from "@/types/project";

interface OpenSourceCarouselProps {
  title?: string;
  showMatchScores?: boolean;
}

export function OpenSourceCarousel({
  title = "Trending Open Source",
  showMatchScores = true,
}: OpenSourceCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const repos = mockOpenSourceRepos;
  const visibleCount = 3;

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex(
        (prev) => (prev + 1) % Math.max(1, repos.length - visibleCount + 1)
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, repos.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => Math.min(repos.length - visibleCount, prev + 1));
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-display font-bold text-white">
            {title}
          </h2>
          {showMatchScores && (
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 font-mono">
              AI Matched
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex >= repos.length - visibleCount}
            className="text-gray-400 hover:text-white disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={containerRef}>
        <div
          className="flex gap-6 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${
              currentIndex * (100 / visibleCount + 2)
            }%)`,
          }}
        >
          {repos.map((repo, index) => (
            <Link
              key={repo.id}
              to={`/dashboard/open-source/${encodeURIComponent(
                repo.full_name
              )}`}
              className="flex-shrink-0 w-[calc(33.333%-16px)] min-w-[300px]"
              style={{
                animation: `stagger-fade-in 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="glass-panel rounded-xl p-6 gradient-border h-full hover:translate-y-[-4px] transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={repo.owner.avatar_url}
                      alt={repo.owner.login}
                      className="w-10 h-10 rounded-lg"
                    />
                    <div>
                      <p className="text-sm text-gray-400 font-mono">
                        {repo.owner.login}
                      </p>
                      <h3 className="font-display font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {repo.name}
                      </h3>
                    </div>
                  </div>
                  {showMatchScores && repo.matchScore && (
                    <MatchScoreRing score={repo.matchScore} size={80} />
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
                  {repo.language && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {repo.language}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {repo.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs text-purple-400 font-mono"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({
          length: Math.max(1, repos.length - visibleCount + 1),
        }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setIsAutoPlaying(false);
              setCurrentIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "bg-cyan-400 w-6"
                : "bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
