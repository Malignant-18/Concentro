import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowToInstallSection from './components/HowToInstallSection';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-satoshi">
      <HeroSection />
      <FeaturesSection />
      <HowToInstallSection />
      <Footer />
    </div>
  );
}