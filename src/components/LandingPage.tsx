import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  Target,
  Code,
  Layers,
  CheckCircle2,
  Github,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchScoreRing } from "./MatchScoreRing";
import { OpenSourceCarousel } from "./OpenSourceCarousel";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description:
      "Our intelligent algorithm analyzes skills, experience, and preferences to find your perfect team match.",
  },
  {
    icon: Target,
    title: "Smart Match Scores",
    description:
      "See exactly why you're matched with each project through transparent AI reasoning.",
  },
  {
    icon: Users,
    title: "Quality Teams",
    description:
      "Connect with verified developers, designers, and product people ready to build.",
  },
  {
    icon: Zap,
    title: "Fast Formation",
    description:
      "Go from idea to assembled team in days, not weeks. Start building faster.",
  },
];

const stats = [
  { value: "10K+", label: "Active Builders" },
  { value: "2.5K", label: "Projects Launched" },
  { value: "92%", label: "Match Success Rate" },
  { value: "48hrs", label: "Avg. Team Formation" },
];

const testimonials = [
  {
    quote:
      "BuildMate helped me find the perfect co-founder for my startup. The AI matching is incredibly accurate.",
    author: "Marcus Johnson",
    role: "Founder @ DeSocial",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    quote:
      "As a designer, I was skeptical about finding good dev partners. BuildMate changed that completely.",
    author: "Emily Rodriguez",
    role: "Product Designer",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
  {
    quote:
      "The match reasoning feature is brilliant. I know exactly why each project is recommended to me.",
    author: "David Kim",
    role: "Senior Engineer",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f1419] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_40%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_40%)] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-2xl font-display font-extrabold text-gradient"
            >
              BuildMate
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/auth?mode=login">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white font-sans"
                >
                  Log In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-mono text-cyan-400">
                AI-Powered Team Formation
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-display font-extrabold text-white leading-tight mb-6">
              Find Your Perfect
              <span className="text-gradient block">Tech Team Match</span>
            </h1>
            <p className="text-xl text-gray-400 font-sans mb-8 leading-relaxed">
              BuildMate uses AI to match developers, designers, and product
              people with projects that fit their skills, experience, and
              availability. Stop searching. Start building.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth?mode=signup&type=collaborator">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold text-lg px-8"
                >
                  Find Projects
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth?mode=signup&type=project_owner">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 font-sans font-semibold text-lg px-8"
                >
                  Post a Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="glass-panel rounded-2xl p-8 gradient-border">
              <div className="flex items-start gap-6">
                <MatchScoreRing score={92} size={100} />
                <div className="flex-1">
                  <h3 className="text-lg font-display font-bold text-white mb-2">
                    AI Code Review Assistant
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-400 font-mono">
                      Backend
                    </span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs text-purple-400 font-mono">
                      Fullstack
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-sans mb-4">
                    Building an intelligent code review tool using GPT-4...
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-300 font-sans">
                        Python & FastAPI experience aligns
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-300 font-sans">
                        Timeline matches availability
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 glass-panel rounded-xl p-4 animate-pulse-glow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-mono text-emerald-400">
                  Match Found!
                </span>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-4 glass-panel rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&q=80"
                    className="w-8 h-8 rounded-full border-2 border-[#0f1419]"
                    alt=""
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&q=80"
                    className="w-8 h-8 rounded-full border-2 border-[#0f1419]"
                    alt=""
                  />
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&q=80"
                    className="w-8 h-8 rounded-full border-2 border-[#0f1419]"
                    alt=""
                  />
                </div>
                <span className="text-xs text-gray-400 font-sans">
                  +2.5K builders this week
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 border-y border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-display font-extrabold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 font-sans">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-extrabold text-white mb-4">
            Why Builders Choose <span className="text-gradient">BuildMate</span>
          </h2>
          <p className="text-lg text-gray-400 font-sans max-w-2xl mx-auto">
            Our AI-powered platform makes team formation effortless, so you can
            focus on what matters: building great products.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-panel rounded-xl p-6 gradient-border hover:translate-y-[-4px] transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 font-sans">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-extrabold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-400 font-sans max-w-2xl mx-auto">
            Get matched with your ideal project or team in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative">
            <div className="glass-panel rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-display font-bold text-white">
                  1
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                Create Your Profile
              </h3>
              <p className="text-gray-400 font-sans">
                Tell us about your skills, experience, and what you're looking
                for in a project or team.
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
          </div>

          <div className="relative">
            <div className="glass-panel rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-display font-bold text-white">
                  2
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                Get AI Matches
              </h3>
              <p className="text-gray-400 font-sans">
                Our AI analyzes thousands of projects and profiles to find your
                perfect matches.
              </p>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent" />
          </div>

          <div>
            <div className="glass-panel rounded-xl py-8 px-7 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-display font-bold text-white">
                  3
                </span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                Start Building
              </h3>
              <p className="text-gray-400 font-sans">
                Connect with your matches, form your team, and start building
                something amazing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - For Project Owners */}
      <section className="relative z-10 bg-white/[0.02] border-y border-white/10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 mb-6">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-mono text-purple-400">
                For Project Owners
              </span>
            </div>
            <h2 className="text-4xl font-display font-extrabold text-white mb-4">
              Build Your Dream Team
            </h2>
            <p className="text-lg text-gray-400 font-sans max-w-2xl mx-auto">
              Post your project and let AI find the perfect collaborators for
              you.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-display font-bold text-white">
                  1
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">
                Post Your Project
              </h3>
              <p className="text-sm text-gray-400 font-sans">
                Describe your project, required skills, and timeline.
              </p>
            </div>
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-display font-bold text-white">
                  2
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">
                AI Finds Matches
              </h3>
              <p className="text-sm text-gray-400 font-sans">
                Our AI analyzes thousands of profiles to find ideal candidates.
              </p>
            </div>
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-display font-bold text-white">
                  3
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">
                Review Applications
              </h3>
              <p className="text-sm text-gray-400 font-sans">
                See match scores and AI reasoning for each applicant.
              </p>
            </div>
            <div className="glass-panel rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-display font-bold text-white">
                  4
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">
                Build Together
              </h3>
              <p className="text-sm text-gray-400 font-sans">
                Accept matches and start collaborating immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <Github className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-mono text-cyan-400">Open Source</span>
          </div>
          <h2 className="text-4xl font-display font-extrabold text-white mb-4">
            Contribute to <span className="text-gradient">Open Source</span>
          </h2>
          <p className="text-lg text-gray-400 font-sans max-w-2xl mx-auto">
            Find open source projects that match your skills. Get AI-powered
            recommendations for issues you can tackle.
          </p>
        </div>

        <OpenSourceCarousel />

        <div className="text-center mt-8">
          <Link to="/auth?mode=signup&type=collaborator">
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 font-sans font-semibold"
            >
              Explore Open Source
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-extrabold text-white mb-4">
            Loved by Builders
          </h2>
          <p className="text-lg text-gray-400 font-sans max-w-2xl mx-auto">
            Join thousands of developers, designers, and product people who've
            found their perfect match.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="glass-panel rounded-xl p-6 gradient-border"
            >
              <p className="text-gray-300 font-sans mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold text-white font-sans">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-gray-400 font-sans">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="glass-panel rounded-2xl p-12 text-center gradient-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10" />
          <div className="relative z-10">
            <h2 className="text-4xl font-display font-extrabold text-white mb-4">
              Ready to Find Your Match?
            </h2>
            <p className="text-lg text-gray-400 font-sans max-w-2xl mx-auto mb-8">
              Join BuildMate today and discover projects and collaborators that
              align perfectly with your skills and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup&type=collaborator">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold text-lg px-8"
                >
                  <Code className="w-5 h-5 mr-2" />
                  I'm a Collaborator
                </Button>
              </Link>
              <Link to="/auth?mode=signup&type=project_owner">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 font-sans font-semibold text-lg px-8"
                >
                  <Layers className="w-5 h-5 mr-2" />
                  I'm a Project Owner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-2xl font-display font-extrabold text-gradient">
              BuildMate
            </div>
            <p className="text-sm text-gray-500 font-sans">
              © 2024 BuildMate. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white font-sans transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white font-sans transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-gray-400 hover:text-white font-sans transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
