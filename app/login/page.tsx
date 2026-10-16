import FoldcraftHero from '@/components/FoldcraftHero';

export const metadata = {
  title: 'RehabPulse — Log in',
  description: 'Log in to continue monitoring your signals.',
};

export default function LoginPage() {
  return <FoldcraftHero initialLoginOpen={true} />;
}
