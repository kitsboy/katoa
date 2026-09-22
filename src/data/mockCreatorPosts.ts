export interface CreatorPostComment {
  user: string;
  text: string;
}

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
  /** New-drop flag — drives the unread badge until the post is seen. */
  isNew?: boolean;
  comments?: CreatorPostComment[];
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
      comments: [
        { user: 'zapfan', text: 'This color grade is unreal 🔥' },
        { user: 'sats_sarah', text: "Friday drop can't come fast enough" },
      ],
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
      comments: [
        { user: 'nodemeister', text: 'The rig setup is next level' },
        { user: 'lightning_liz', text: 'Travel diaries are my favorite' },
      ],
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
      comments: [
        { user: 'bali_boy', text: 'Bali is going to be epic 🌊' },
        { user: 'satstacker', text: 'Take me with you!' },
      ],
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
      isNew: true,
      comments: [
        { user: 'vote_vicky', text: 'Studio night!' },
        { user: 'privacy_pat', text: 'Anything but a gym shoot 🙏' },
      ],
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
      comments: [
        { user: 'movement_mia', text: 'That midnight piece was stunning' },
        { user: 'zapdad', text: 'The lighting! 😍' },
      ],
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
      comments: [
        { user: 'warmup_wayne', text: 'Form looks so clean' },
        { user: 'sats_sam', text: "Can't wait for the reel" },
      ],
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
      comments: [
        { user: 'studio_stu', text: 'Light test is coming together' },
        { user: 'fan_fran', text: 'More behind the scenes please!' },
      ],
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
      isNew: true,
      comments: [
        { user: 'city_cat', text: 'Lisbon next please!' },
        { user: 'zap_zoe', text: 'Tokyo! 🇯🇵' },
      ],
    },
  ],
  'paul-artist-guitar': [
    {
      id: 'paul-post-1',
      creatorSlug: 'paul-artist-guitar',
      mediaUrl: '/images/mock/pexels-5e89e84d08.jpeg',
      mediaType: 'image',
      caption: 'Broadway at golden hour — road-tested songs, one worn-out guitar.',
      likeCount: 4200,
      commentCount: 71,
      isLocked: false,
      pinned: true,
      comments: [{ user: 'music_maker', text: 'Keep the street sessions coming 🎸' }],
    },
    {
      id: 'paul-post-2',
      creatorSlug: 'paul-artist-guitar',
      mediaUrl: '/images/mock/pexels-fae5ab023a.jpeg',
      mediaType: 'image',
      caption: 'The next guitar fund update: one step closer to recording the first EP.',
      likeCount: 3100,
      commentCount: 44,
      isLocked: false,
      isNew: true,
      comments: [{ user: 'roadie_rob', text: 'The first EP is going to sound great.' }],
    },
    {
      id: 'paul-post-3',
      creatorSlug: 'paul-artist-guitar',
      mediaUrl: '/images/mock/pexels-beab903d8f.jpeg',
      mediaType: 'image',
      caption: 'Small goal, real milestone: strings and a case are fully funded.',
      likeCount: 2700,
      commentCount: 39,
      isLocked: false,
      comments: [{ user: 'music_maker', text: 'Love seeing the progress broken into steps.' }],
    },
  ],
  'medellin-skate-park': [
    {
      id: 'skate-post-1',
      creatorSlug: 'medellin-skate-park',
      mediaUrl: '/images/mock/pexels-2a6bfc8ddf.jpeg',
      mediaType: 'image',
      caption: 'Concrete, wheels, and a safe place to land — construction update from Comuna 13.',
      likeCount: 8700,
      commentCount: 133,
      isLocked: false,
      pinned: true,
      comments: [{ user: 'skate_family', text: 'This is going to change lives.' }],
    },
    {
      id: 'skate-post-2',
      creatorSlug: 'medellin-skate-park',
      mediaUrl: '/images/mock/pexels-0627eaa705.jpeg',
      mediaType: 'image',
      caption: 'What the first 100 helmets and boards will unlock for local kids.',
      likeCount: 5900,
      commentCount: 88,
      isLocked: false,
      isNew: true,
      comments: [{ user: 'skate_family', text: 'The equipment list makes the goal easy to understand.' }],
    },
    {
      id: 'skate-post-3',
      creatorSlug: 'medellin-skate-park',
      mediaUrl: '/images/mock/pexels-e175180aee.jpeg',
      mediaType: 'image',
      caption: 'Next chapter: lights mean safer evening sessions and more room to learn.',
      likeCount: 4300,
      commentCount: 52,
      isLocked: false,
      comments: [{ user: 'night_skater', text: 'Evening sessions would be huge for the community.' }],
    },
  ],
};
