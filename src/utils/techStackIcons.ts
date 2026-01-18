// Tech stack icon mapping
export const techStackIcons: Record<string, string> = {
  // Frontend
  'react': '⚛️',
  'vue': '💚',
  'angular': '🅰️',
  'svelte': '🔥',
  'next.js': '▲',
  'nextjs': '▲',
  'nuxt': '💚',
  'gatsby': '🟣',
  
  // Backend
  'node.js': '🟢',
  'nodejs': '🟢',
  'express': '🚂',
  'nestjs': '🐈',
  'django': '🐍',
  'flask': '🌶️',
  'fastapi': '⚡',
  'spring': '🍃',
  'laravel': '🔴',
  'rails': '🛤️',
  'ruby': '💎',
  
  // Databases
  'mongodb': '🍃',
  'postgresql': '🐘',
  'mysql': '🐬',
  'redis': '🔴',
  'sqlite': '📦',
  'firebase': '🔥',
  'supabase': '⚡',
  
  // Languages
  'javascript': '💛',
  'typescript': '💙',
  'python': '🐍',
  'java': '☕',
  'go': '🐹',
  'rust': '🦀',
  'php': '🐘',
  'c++': '⚙️',
  'c#': '🎯',
  'swift': '🦅',
  'kotlin': '🟣',
  
  // Cloud & DevOps
  'aws': '☁️',
  'azure': '☁️',
  'gcp': '☁️',
  'docker': '🐳',
  'kubernetes': '☸️',
  'terraform': '🏗️',
  
  // Tools & Others
  'git': '📦',
  'graphql': '🔷',
  'rest': '🔗',
  'tailwind': '🎨',
  'tailwind css': '🎨',
  'sass': '💅',
  'webpack': '📦',
  'vite': '⚡',
};

export function getTechIcon(techName: string): string {
  const normalized = techName.toLowerCase().trim();
  return techStackIcons[normalized] || '💻';
}

export function getTechCategory(techName: string): string {
  const normalized = techName.toLowerCase().trim();
  
  const frontend = ['react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'tailwind', 'tailwind css'];
  const backend = ['node.js', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails'];
  const database = ['mongodb', 'postgresql', 'mysql', 'redis', 'sqlite', 'firebase', 'supabase'];
  const devops = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform'];
  
  if (frontend.includes(normalized)) return 'frontend';
  if (backend.includes(normalized)) return 'backend';
  if (database.includes(normalized)) return 'database';
  if (devops.includes(normalized)) return 'devops';
  
  return 'other';
}
