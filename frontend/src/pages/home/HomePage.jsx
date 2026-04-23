import React from 'react';
import HeroSection from '../../components/home/HeroSection';
import HowItWorks from '../../components/home/HowItWorks';
import FeaturesSection from '../../components/home/FeaturesSection';
import Testimonials from '../../components/home/Testimonials';
import CTASection from '../../components/home/CTASection';

// Navbar and Footer are provided by MainLayout — no need to import here
const HomePage = () => (
  <>
    <HeroSection />
    <HowItWorks />
    <FeaturesSection />
    <Testimonials />
    <CTASection />
  </>
);

export default HomePage;
