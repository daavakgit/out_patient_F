import { Metadata } from 'next';
import FoldcraftHero from '@/components/FoldcraftHero';

export const metadata: Metadata = {
  title: 'Foldcraft — Creative Studio',
  description: 'Shaping visual narratives, one pixel at a time.',
};

export default function LandingPage() {
  return <FoldcraftHero />;
}
