import { Routes, Route } from "react-router-dom";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Statistics } from "./components/Statistics";
import { Catalog } from "./components/Catalog";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { Footer } from "./components/Footer";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { useState } from "react";
import AdminApp from "./admin/AdminApp";
import { SEOHead } from "./components/SEOHead";

function Landing() {
  const [currentPage, setCurrentPage] = useState<'home' | 'privacy' | 'terms'>('home');

  if (currentPage === 'privacy') {
    return <PrivacyPolicy onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'terms') {
    return <TermsOfService onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-primary-foreground">
      <SEOHead />
      <Hero />
      <Statistics />
      <Features />
      <Catalog />
      <Testimonials />
      <Pricing />
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<Landing />} />
    </Routes>
  );
}
