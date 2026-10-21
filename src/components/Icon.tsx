import { BookOpen, Moon, Footprints, Droplets, Smartphone, Heart, Sun, Sprout } from 'lucide-react';
import type { Habit } from '../model';
const iconMap = {
  leaf: Sprout,
  book: BookOpen,
  moon: Moon,
  walk: Footprints,
  water: Droplets,
  phone: Smartphone,
  heart: Heart,
  sun: Sun,
};
export function HabitIcon({ name, size = 22 }: { name: Habit['icon']; size?: number }) {
  const Icon = iconMap[name];
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}
export function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}
