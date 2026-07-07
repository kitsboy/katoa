import contributors from '../data/contributors.json';
import { Github, ExternalLink } from 'lucide-react';

export function ContributorsWall() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {contributors.map((c) => (
        <div key={c.name} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
          <p className="text-sm font-semibold text-white truncate">{c.name}</p>
          <p className="text-[10px] text-gray-500 mb-2">{c.role}</p>
          {c.github && (
            <a
              href={`https://github.com/${c.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-neon-cyan-400 hover:underline"
            >
              <Github size={12} /> GitHub
            </a>
          )}
          {c.url && (
            <a href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-neon-cyan-400 hover:underline">
              <ExternalLink size={12} /> Site
            </a>
          )}
        </div>
      ))}
    </div>
  );
}