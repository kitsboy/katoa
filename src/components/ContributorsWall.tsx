import { memo } from 'react';
import contributors from '../data/contributors.json';
import { Github, ExternalLink, Users } from 'lucide-react';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export const ContributorsWall = memo(function ContributorsWall({
  compact = false,
}: {
  /** Compact one-row strip for the footer; default renders the full wall. */
  compact?: boolean;
}) {
  if (!contributors.length) {
    return (
      <div className="text-center py-8 px-4 rounded-xl bg-white/[0.03] border border-white/10">
        <Users size={32} className="mx-auto text-gray-500 mb-3" />
        <p className="text-gray-400 text-sm">Contributors will appear here as the project grows.</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
        role="list"
        aria-label="Project contributors"
      >
        {contributors.map((c) => (
          <div
            key={c.name}
            role="listitem"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-charcoal-900 pl-1 pr-3 py-1 hover:border-neon-cyan-500/30 transition-colors"
          >
            <span
              className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-cyan-500/30 to-bitcoin-orange-500/30 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white"
              aria-hidden
            >
              {getInitials(c.name)}
            </span>
            <span className="text-xs font-semibold text-white">{c.name}</span>
            {c.github ? (
              <a
                href={`https://github.com/${c.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan-400 hover:underline text-[11px]"
                aria-label={`${c.name} on GitHub`}
              >
                GitHub
              </a>
            ) : c.url ? (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan-400 hover:underline text-[11px]"
                aria-label={`${c.name} website`}
              >
                Site
              </a>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="list" aria-label="Project contributors">
      {contributors.map((c) => (
        <div
          key={c.name}
          role="listitem"
          className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center hover:border-neon-cyan-500/30 transition-colors"
        >
          <div
            className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-neon-cyan-500/30 to-bitcoin-orange-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-white"
            aria-hidden
          >
            {getInitials(c.name)}
          </div>
          <p className="text-sm font-semibold text-white truncate">{c.name}</p>
          <p className="text-[10px] text-gray-500 mb-2">{c.role}</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {c.github && (
              <a
                href={`https://github.com/${c.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-neon-cyan-400 hover:underline min-h-[32px]"
                aria-label={`${c.name} on GitHub`}
              >
                <Github size={12} aria-hidden /> GitHub
              </a>
            )}
            {c.url && (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-neon-cyan-400 hover:underline min-h-[32px]"
                aria-label={`${c.name} website`}
              >
                <ExternalLink size={12} aria-hidden /> Site
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});