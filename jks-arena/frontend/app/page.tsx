"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/auth";

import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FacilitiesSection from "@/components/landing/FacilitiesSection";
import Games from "@/components/landing/Games";
import AboutSection from "@/components/landing/AboutSection";
import ReviewsSection from "@/components/landing/ReviewsSection";
import LocationSection from "@/components/landing/LocationSection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  const [desktopImages, setDesktopImages] = useState<string[]>([]);
  const [mobileImages, setMobileImages] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // 🔥 Fetch images from DB and filter by Desktop/Mobile Views
  useEffect(() => {
    async function fetchBackgrounds() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media`);
        const data = await res.json();

        if (data.items) {
          const desktop = data.items
            .filter((item: any) => item.category === "Application" && item.view === "Desktop")
            .map((item: any) => item.secure_url);

          const mobile = data.items
            .filter((item: any) => item.category === "Application" && item.view === "Mobile")
            .map((item: any) => item.secure_url);

          setDesktopImages(desktop.length > 0 ? desktop : ["https://res.cloudinary.com/dle9e8kwq/image/upload/v1778053508/Photos/Application/b2sroykaouke7ydut1ce.jpg"]);
          setMobileImages(mobile.length > 0 ? mobile : ["https://res.cloudinary.com/dle9e8kwq/image/upload/v1778053392/Photos/Application/vnuoihogngfcbrxvxfzm.jpg"]);
        }
      } catch (err) {
        console.error("Failed to load hero backgrounds:", err);
      }
    }
    fetchBackgrounds();
  }, []);

  // 🔥 Slider Logic
  useEffect(() => {
    const maxLen = Math.max(desktopImages.length, mobileImages.length);
    if (maxLen <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % maxLen);
    }, 5000); 
    return () => clearInterval(interval);
  }, [desktopImages.length, mobileImages.length]);

  return (
    <main className="bg-[#151520] min-h-screen text-white relative selection:bg-[#ff6b35] selection:text-white">

      {/* =========================================================
          🔥 GLOBAL FIXED DYNAMIC BACKGROUND
      ========================================================= */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* DESKTOP VIEW */}
        <div className="hidden md:block w-full h-full relative">
          {desktopImages.map((src, idx) => (
            <div 
              key={`desktop-${idx}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="absolute inset-0 w-full h-full animate-pan">
                <Image src={src} alt="Desktop Background" fill sizes="100vw" priority={idx === 0} className="object-cover" style={{filter:'brightness(0.90)'}} />
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE VIEW */}
        <div className="block md:hidden w-full h-full relative">
          {mobileImages.map((src, idx) => (
            <div 
              key={`mobile-${idx}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="absolute inset-0 w-full h-full animate-pan">
                <Image src={src} alt="Mobile Background" fill priority={idx === 0} className="object-cover" style={{filter:'brightness(0.90)'}} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================
          🔥 MAIN SCROLLING CONTENT
      ========================================================= */}
      <div className="relative z-10">

  <Navbar />

  <HeroSection />

  {/* DIVIDER */}
  <div className="flex justify-center px-6">
    <div className="w-full max-w-[1600px] h-[3px] rounded-full bg-linear-to-r from-transparent via-[#FFFFFF]/90 to-transparent shadow-[0_0_30px_rgba(255,107,53,0.45)]"></div>
  </div>

  <FacilitiesSection />

  {/* DIVIDER */}
  <div className="flex justify-center px-6">
    <div className="w-full max-w-[1600px] h-[3px] rounded-full bg-linear-to-r from-transparent via-white/60 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.15)]"></div>
  </div>

  <Games />

  {/* DIVIDER */}
  <div className="flex justify-center px-6">
    <div className="w-full max-w-[1600px] h-[3px] rounded-full bg-linear-to-r from-transparent via-[#ff6b35]/80 to-transparent shadow-[0_0_30px_rgba(255,107,53,0.4)]"></div>
  </div>

  <AboutSection />

  {/* DIVIDER */}
  <div className="flex justify-center px-6">
    <div className="w-full max-w-[1600px] h-[3px] rounded-full bg-linear-to-r from-transparent via-white/60 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.15)]"></div>
  </div>

  <ReviewsSection />

  {/* DIVIDER */}
  <div className="flex justify-center px-6">
    <div className="w-full max-w-[1600px] h-[3px] rounded-full bg-linear-to-r from-transparent via-[#ff6b35]/80 to-transparent shadow-[0_0_30px_rgba(255,107,53,0.4)]"></div>
  </div>

  <LocationSection />

  {/* DIVIDER */}
  <div className="flex justify-center px-6">
    <div className="w-full max-w-[1600px] h-[3px] rounded-full bg-linear-to-r from-transparent via-[#ff6b35]/90 to-transparent shadow-[0_0_35px_rgba(255,107,53,0.5)]"></div>
  </div>

  <Footer />

</div>
    </main>
  );
}