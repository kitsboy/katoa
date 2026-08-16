export interface CreatorPost {
  id: string;
  creatorSlug: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  likeCount: number;
  commentCount: number;
  isLocked: boolean;
  /** PPV price in sats when set — otherwise locked posts require a subscription. */
  priceSats?: number;
  pinned?: boolean;
}

/**
 * Tasteful, PG-13 creator posts (travel / fitness / art / dance).
 * Adult content is intentionally NOT here — see docs/OF-PARITY-ROADMAP.md.
 */
export const mockCreatorPosts: Record<string, CreatorPost[]> = {
  'luna-exclusive-videos': [
    {
      id: 'luna-post-1',
      creatorSlug: 'luna-exclusive-videos',
      mediaUrl: '/images/mock/pexels-7867fa1faf.jpeg',
      mediaType: 'image',
      caption: 'Golden hour in the studio — new drop this Friday. 🌇',
      likeCount: 12400,
      commentCount: 182,
      isLocked: false,
      pinned: true,
    },
    {
      id: 'luna-post-2',
      creatorSlug: 'luna-exclusive-videos',
      mediaUrl: '/images/mock/pexels-8e8235f258.jpeg',
      mediaType: 'image',
      caption: 'Behind the scenes: rigging the next travel diary episode.',
      likeCount: 9800,
      commentCount: 96,
      isLocked: false,
    },
    {
      id: 'luna-post-3',
      creatorSlug: 'luna-exclusive-videos',
      mediaUrl: '/images/mock/pexels-cc85b66a24.jpeg',
      mediaType: 'video',
      caption: 'Members-only cut — full studio session, 4K.',
      likeCount: 15300,
      commentCount: 240,
      isLocked: true,
    },
    {
      id: 'luna-post-4',
      creatorSlug: 'luna-exclusive-videos',
      mediaUrl: '/images/mock/pexels-1a16f86d64.jpeg',
      mediaType: 'image',
      caption: 'Coastline scouting for the Bali episode. 🏝️',
      likeCount: 8200,
      commentCount: 74,
      isLocked: false,
    },
    {
      id: 'luna-post-5',
      creatorSlug: 'luna-exclusive-videos',
      mediaUrl: '/images/mock/pexels-577441d9bf.jpeg',
      mediaType: 'image',
      caption: 'Early-access still — unlock this one solo.',
      likeCount: 11000,
      commentCount: 130,
      isLocked: true,
      priceSats: 21000,
    },
    {
      id: 'luna-post-6',
      creatorSlug: 'luna-exclusive-videos',
      mediaUrl: '/images/mock/pexels-7430c3f2c8.jpeg',
      mediaType: 'image',
      caption: 'Vote in the comments: next shoot theme?',
      likeCount: 6900,
      commentCount: 210,
      isLocked: false,
    },
  ],
  'sasha-vip-content': [
    {
      id: 'sasha-post-1',
      creatorSlug: 'sasha-vip-content',
      mediaUrl: '/images/mock/pexels-b7f18dd14d.jpeg',
      mediaType: 'image',
      caption: 'Choreography reel — midnight session. 🌙',
      likeCount: 15800,
      commentCount: 302,
      isLocked: false,
      pinned: true,
    },
    {
      id: 'sasha-post-2',
      creatorSlug: 'sasha-vip-content',
      mediaUrl: '/images/mock/pexels-9edbeb2b48.jpeg',
      mediaType: 'image',
      caption: 'Warm-up before the golden-hour shoot.',
      likeCount: 9100,
      commentCount: 88,
      isLocked: false,
    },
    {
      id: 'sasha-post-3',
      creatorSlug: 'sasha-vip-content',
      mediaUrl: '/images/mock/pexels-45c4be1ad1.jpeg',
      mediaType: 'video',
      caption: 'Full movement piece — subscribers only.',
      likeCount: 18700,
      commentCount: 421,
      isLocked: true,
    },
    {
      id: 'sasha-post-4',
      creatorSlug: 'sasha-vip-content',
      mediaUrl: '/images/mock/pexels-5e89e84d08.jpeg',
      mediaType: 'image',
      caption: 'Studio light test. Coming together nicely.',
      likeCount: 7200,
      commentCount: 63,
      isLocked: false,
    },
    {
      id: 'sasha-post-5',
      creatorSlug: 'sasha-vip-content',
      mediaUrl: '/images/mock/pexels-02110df489.jpeg',
      mediaType: 'image',
      caption: 'Solo cut — unlock this one with a tip.',
      likeCount: 13400,
      commentCount: 176,
      isLocked: true,
      priceSats: 21000,
    },
    {
      id: 'sasha-post-6',
      creatorSlug: 'sasha-vip-content',
      mediaUrl: '/images/mock/pexels-1e4c9eed79.jpeg',
      mediaType: 'image',
      caption: 'Which city should the next series visit?',
      likeCount: 8100,
      commentCount: 240,
      isLocked: false,
    },
  ],
};
