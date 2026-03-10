import HeroSection from "../components/HeroSection";
import FeaturedServices from "../components/home/FeaturedServices";
import UpcomingEvents from "../components/home/UpcomingEvents";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";
import CTA from "../components/home/CTA";

const Home = () => {
  return (
    <>
      <HeroSection />
      <FeaturedServices />
      <UpcomingEvents />
      <WhyChooseUs />
      <Testimonials />
      <CTA />
    </>
  );
};

export default Home;
