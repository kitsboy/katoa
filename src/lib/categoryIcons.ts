import {
  Baby,
  Cake,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Laptop,
  Plane,
  Tag,
  type LucideIcon,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Baby,
  Cake,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Laptop,
  Plane,
  Tag,
};

export function getCategoryIcon(name?: string): LucideIcon {
  if (!name) return Tag;
  return CATEGORY_ICONS[name] ?? Tag;
}