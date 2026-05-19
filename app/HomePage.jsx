import AnimationScripts from "./components/AnimationScripts";
import VideoPopup from "./sections/VideoPopup";
import Navigation from "./sections/Navigation";
import HeroSection from "./sections/HeroSection";
import VideoSection from "./sections/VideoSection";
import LoungeOfTheYear from "./sections/LoungeOfTheYear";
import AwardsShowcase from "./sections/AwardsShowcase";
import OneToWatch from "./sections/OneToWatch";
import FinalistsSection from "./sections/FinalistsSection";
import Footer from "./sections/Footer";

export default function HomePage() {
  return (
    <>
      <VideoPopup />
      <div className="page-wrap">
        <div className="page-main">
          <Navigation />
          <HeroSection />
          <VideoSection />
          <LoungeOfTheYear />
          <AwardsShowcase />
          <OneToWatch />
          <FinalistsSection />
          <Footer />
        </div>
      </div>
      <AnimationScripts />
    </>
  );
}
