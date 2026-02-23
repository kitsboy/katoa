import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Calendar, Tag } from 'lucide-react';
import { GlassSection } from './GlassSection';

interface PostData {
    title: string;
    date: string;
    category: string;
    content: string;
}

export function ProtocolUpdates() {
    const [post, setPost] = useState<PostData | null>(null);

    useEffect(() => {
        const fetchUpdate = async () => {
            try {
                const timestamp = new Date().getTime();
                const response = await fetch(`/content/updates.md?t=${timestamp}`);
                if (!response.ok) return;

                const text = await response.text();

                // Very basic frontmatter parser (for our simple format)
                const match = text.match(/---\n([\s\S]*?)\n---\n([\s\S]*)/);

                if (match) {
                    const frontmatterStr = match[1];
                    const content = match[2];

                    const meta: any = {};
                    frontmatterStr.split('\n').forEach(line => {
                        const [key, ...vals] = line.split(':');
                        if (key && vals.length) {
                            meta[key.trim()] = vals.join(':').trim().replace(/^"|"$/g, '');
                        }
                    });

                    setPost({
                        title: meta.title || 'Live Update',
                        date: meta.date || 'Recent',
                        category: meta.category || 'Updates',
                        content: content.trim()
                    });
                }
            } catch (err) {
                console.error('Error fetching markdown post', err);
            }
        };

        fetchUpdate();
        const interval = setInterval(fetchUpdate, 5 * 60 * 1000); // Check for new articles every 5 minutes
        return () => clearInterval(interval);
    }, []);

    if (!post) {
        return null; // Don't show anything until content streams in
    }

    return (
        <GlassSection className="max-w-3xl mx-auto mt-8 font-sans text-left" glow="orange">
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
                <FileText className="text-bitcoin-orange" size={24} />
                <h2 className="text-2xl font-bold font-display text-white tracking-wide">Live Protocol Updates</h2>
                <div className="ml-auto flex items-center gap-2 text-xs font-mono text-neon-cyan bg-neon-cyan/10 px-3 py-1 rounded-full border border-neon-cyan/20">
                    <div className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-ping"></div>
                    Streaming from Kimi
                </div>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-bitcoin-orange to-yellow-500 rounded-l-xl"></div>

                <h3 className="text-2xl font-bold font-display text-white mb-3 group-hover:text-bitcoin-orange transition-colors">
                    {post.title}
                </h3>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-400 mb-6">
                    <div className="flex items-center gap-1">
                        <Calendar size={14} /> {post.date}
                    </div>
                    <div className="flex items-center gap-1 text-neon-cyan">
                        <Tag size={14} /> {post.category}
                    </div>
                </div>

                <div className="prose prose-invert prose-orange max-w-none text-gray-300">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>
            </div>
        </GlassSection>
    );
}
