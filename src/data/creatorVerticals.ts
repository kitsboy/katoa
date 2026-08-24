/**
 * Creator verticals for sovereign support: models, athletes, meal planners,
 * golf, moms, musicians, and anyone who creates. Zero platform fees;
 * Bitcoin-native tips + wishlists + tiers. Not an OnlyFans alternative in UI copy.
 */
export type CreatorVertical = {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  /** Suggested wishlist item seeds */
  itemSeeds: string[];
  /** Explore/search keywords */
  tags: string[];
};

export const CREATOR_VERTICALS: CreatorVertical[] = [
  {
    id: 'model',
    label: 'Model / influencer',
    emoji: '✨',
    blurb: 'Tips, exclusive drops, shoot funds, and fan wishlists — keep 100%.',
    itemSeeds: ['Studio day', 'Outfit for shoot', 'Lighting kit', 'Travel to casting'],
    tags: ['model', 'influencer', 'fashion', 'beauty', 'creator'],
  },
  {
    id: 'fitness',
    label: 'Fitness & wellness',
    emoji: '💪',
    blurb: 'Program launches, gym gear, retreats. Supporters fund your next PR.',
    itemSeeds: ['Home gym gear', 'Competition fees', 'Meal prep week', 'Recovery tools'],
    tags: ['fitness', 'gym', 'wellness', 'coach'],
  },
  {
    id: 'meals',
    label: 'Meal planner / chef',
    emoji: '🥗',
    blurb: 'Cookbook print runs, kitchen tools, recipe video days.',
    itemSeeds: ['Camera for recipes', 'Kitchen upgrade', 'Print cookbook', 'Prop ingredients'],
    tags: ['food', 'chef', 'meal plan', 'recipes'],
  },
  {
    id: 'golf',
    label: 'Golf & sports',
    emoji: '⛳',
    blurb: 'Tournament entries, clubs, travel. Fans back the bag — not the platform.',
    itemSeeds: ['Tournament entry', 'New irons', 'Travel & lodging', 'Lessons'],
    tags: ['golf', 'sports', 'athlete', 'tennis', 'soccer'],
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle & moms',
    emoji: '🏡',
    blurb: 'Family content, home projects, everyday creator tips with dignity.',
    itemSeeds: ['Home office setup', 'Kid activity fund', 'Camera', 'Self-care day'],
    tags: ['mom', 'family', 'lifestyle', 'parenting'],
  },
  {
    id: 'music',
    label: 'Music & performance',
    emoji: '🎵',
    blurb: 'Albums, merch, tour legs — patrons fund art, not fees.',
    itemSeeds: ['Studio hours', 'Mixing', 'Merch drop', 'Tour van'],
    tags: ['music', 'artist', 'band', 'dj'],
  },
  {
    id: 'education',
    label: 'Coach & educator',
    emoji: '📚',
    blurb: 'Courses, workshops, classroom supplies. Teach freely, earn fully.',
    itemSeeds: ['Course platform', 'Workshop space', 'Mic & lights', 'Scholarships'],
    tags: ['coach', 'teacher', 'course', 'education'],
  },
  {
    id: 'creator',
    label: 'Any creator',
    emoji: '⚡',
    blurb: 'If you create value, KATOA is your tip jar + wishlist. Zero cut. Forever.',
    itemSeeds: ['Content day', 'Gear upgrade', 'Collab fund', 'Emergency buffer'],
    tags: ['creator', 'general', 'tips'],
  },
];

export function verticalById(id: string): CreatorVertical | undefined {
  return CREATOR_VERTICALS.find((v) => v.id === id);
}
