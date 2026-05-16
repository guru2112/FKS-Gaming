"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser, API_BASE_URL } from "@/lib/auth";
import Image from "next/image";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import ForgotPasswordModal from "@/components/ForgotPasswordModal"; 

// ==========================================
// 1. MAIN LOGIN CONTENT COMPONENT
// ==========================================
function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const [desktopImages, setDesktopImages] = useState<string[]>([]);
  const [mobileImages, setMobileImages] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Fetch background images from your API
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
        console.error("Failed to load backgrounds:", err);
      }
    }
    fetchBackgrounds();
  }, []);

  // Rotate images every 5 seconds
  useEffect(() => {
    const maxLen = Math.max(desktopImages.length, mobileImages.length);
    if (maxLen <= 1) return;
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % maxLen);
    }, 5000); 
    return () => clearInterval(interval);
  }, [desktopImages.length, mobileImages.length]);

  // Handle Standard Email/Password Login
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // ✅ loginUser internally calls saveSession — no manual localStorage needed
      const data = await loginUser({ email, password });
      setMessage("Login successful.");
      router.push(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      const err = error as Error;
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const clipPathStyle = {
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)"
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#ff6b35] via-[#a33810] to-[#0A0A0A] flex flex-col relative overflow-hidden selection:bg-white selection:text-[#ff6b35]">
        
        {/* Corner Vignette Shadows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#050505] blur-[150px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#050505] blur-[150px] rounded-full pointer-events-none z-0"></div>

        <style>{`
          @keyframes pan-image {
            0% { transform: scale(1.05) translateX(2%); }
            100% { transform: scale(1.05) translateX(-2%); }
          }
          .animate-pan { animation: pan-image 20s ease-in-out infinite alternate; }
        `}</style>

        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 w-full">
          
          {/* MOBILE ONLY BRANDING (Outside Card) */}
          <div className="md:hidden relative z-20 flex flex-col items-center mb-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-5xl font-black italic tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              <span className="text-white">JKS </span>
              <span className="text-[#ff6b35] drop-shadow-[0_0_30px_rgba(255,107,53,0.3)]">ARENA</span>
            </div>
            <div className="mt-2">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 drop-shadow-md block">
                EAT, SLEEP, GAME, REPEAT
              </span>
              <div className="h-[2px] w-12 bg-[#ff6b35] mx-auto mt-2 rounded-full shadow-[0_0_10px_#ff6b35]"></div>
            </div>
          </div>

          {/* Floating Card - 60/40 Split */}
          <div className="relative z-10 flex flex-col md:flex-row w-full max-w-6xl rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] min-h-[600px] md:min-h-[550px]">
            
            {/* IMAGE PANE (60% Desktop) */}
            <div className="absolute inset-0 md:relative md:w-[60%] overflow-hidden bg-black z-0">
              <div className="hidden md:block w-full h-full relative">
                {desktopImages.map((src, idx) => (
                  <div key={`desktop-${idx}`} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                    <div className="absolute inset-0 animate-pan">
                      <Image src={src} alt="Desktop Background" fill sizes="(max-width: 768px) 100vw, 60vw" priority={idx === 0} className="object-cover opacity-90" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="block md:hidden w-full h-full relative">
                {mobileImages.map((src, idx) => (
                  <div key={`mobile-${idx}`} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                    <div className="absolute inset-0 animate-pan">
                      <Image src={src} alt="Mobile Background" fill sizes="(max-width: 768px) 100vw, 60vw" priority={idx === 0} className="object-cover opacity-90" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-[#0A0A0A]/40 to-[#0A0A0A] z-20"></div>
            </div>

            {/* FORM PANE (40% Desktop) */}
            <div className="relative z-10 w-full md:w-[40%] flex-1 flex flex-col items-center justify-center p-8 sm:p-12 md:p-12 bg-black/40 backdrop-blur-[1px] md:bg-[#0A0A0A] md:backdrop-blur-none border-t border-white/10 md:border-none">
              
              <button 
                onClick={() => router.push("/")}
                className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-[#ff6b35] transition-colors p-2 z-50 drop-shadow-md"
                aria-label="Close to Home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="w-full max-w-sm mt-4 md:mt-0">
                
                {/* DESKTOP ONLY BRANDING (Inside Card) */}
                <div className="hidden md:flex flex-col items-center mb-10 text-center w-full animate-in fade-in zoom-in-95 duration-700">
                  <div className="text-4xl lg:text-5xl font-black italic tracking-tighter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                    <span className="text-white">JKS </span>
                    <span className="text-[#ff6b35] drop-shadow-[0_0_30px_rgba(255,107,53,0.3)]">ARENA</span>
                  </div>
                  <div className="mt-2 relative">
                    <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block">
                      EAT, SLEEP, GAME, REPEAT
                    </span>
                    <div className="h-[2px] w-8 bg-[#ff6b35] mx-auto mt-2 rounded-full shadow-[0_0_10px_#ff6b35]"></div>
                  </div>
                </div>

                {/* MOBILE ONLY HEADER (Inside Card) */}
                <div className="md:hidden mb-8 text-center mt-2 animate-in fade-in zoom-in-95 duration-700">
                  <h1 className="font-display text-3xl font-black uppercase tracking-wider text-white drop-shadow-md">
                    LOG IN ACCOUNT
                  </h1>
                  <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase drop-shadow-md">
                    WELCOME BACK
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px] transition-transform hover:scale-[1.01]">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      style={clipPathStyle}
                      className="w-full bg-[#0A0A0A]/90 px-5 py-3.5 text-xs font-bold tracking-widest text-white outline-none placeholder:text-white/40"
                      placeholder="ENTER EMAIL"
                    />
                  </div>
                  
                  <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px] transition-transform hover:scale-[1.01]">
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      style={clipPathStyle}
                      className="w-full bg-[#0A0A0A]/90 px-5 py-3.5 text-xs font-bold tracking-widest text-white outline-none placeholder:text-white/40"
                      placeholder="ENTER PASSWORD"
                    />
                  </div>
                  
                  <div className="flex justify-center md:justify-start pl-1">
                    <button 
                      type="button" 
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/80 hover:text-[#ff6b35] transition-colors drop-shadow-md"
                    >
                      FORGOT PASSWORD?
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      style={clipPathStyle}
                      className="w-full bg-[#ff6b35] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#e05928] disabled:cursor-not-allowed disabled:opacity-60 shadow-[0_0_20px_rgba(255,107,53,0.3)]"
                    >
                      {isLoading ? "LOGGING IN..." : "LOG IN"}
                    </button>
                    
                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-[1px] bg-white/10"></div>
                      <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">OR</span>
                      <div className="flex-1 h-[1px] bg-white/10"></div>
                    </div>

                    {/* 🔥 Reusable Google Auth Component handles the TS error correctly */}
                    <GoogleAuthButton 
                      onLoading={setIsLoading} 
                      onError={(err: string) => setMessage(err)} 
                    />

                    <button
                      type="button"
                      onClick={() => router.push("/signup")}
                      disabled={isLoading}
                      style={clipPathStyle}
                      className="w-full bg-[#ff6b35] p-[1.5px] transition-all hover:bg-[#e05928] disabled:cursor-not-allowed disabled:opacity-60 shadow-lg mt-1"
                    >
                      <div style={clipPathStyle} className="bg-[#0A0A0A]/90 w-full h-full py-3.5 flex items-center justify-center transition-colors hover:bg-[#ff6b35]/20">
                        <span className="text-xs font-black uppercase tracking-widest text-[#ff6b35]">SIGN UP</span>
                      </div>
                    </button>
                  </div>

                  {message && (
                    <p className={`text-[10px] text-center font-bold tracking-wider mt-4 uppercase drop-shadow-md ${message.includes('successful') ? 'text-neo-green' : 'text-[#ff6b35]'}`}>
                      {message}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full relative z-20 bg-[#0A0A0A]/80 backdrop-blur-md border-t border-white/10 pt-6 pb-6 px-6 sm:px-12 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <span className="text-xl font-black italic tracking-tighter text-white">
                JKS <span className="text-[#ff6b35]">ARENA</span>
              </span>
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-300 text-center">
              &copy; {new Date().getFullYear()} JKS Arena. All Rights Reserved.
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-200 hover:text-[#ff6b35] transition-colors">
                Privacy
              </a>
              <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-200 hover:text-[#ff6b35] transition-colors">
                Terms
              </a>
              <a href="#" className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-200 hover:text-[#ff6b35] transition-colors">
                Support
              </a>
            </div>
          </div>
        </footer>

      </div>

      {/* Render the Modal Component */}
      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </>
  );
}

// ==========================================
// 2. PAGE WRAPPER (Handles Missing Config Safely)
// ==========================================
export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white p-4">
        <div className="text-center max-w-md p-8 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-[#ff6b35] font-black uppercase tracking-widest text-sm mb-4">Configuration Error</p>
          <p className="text-slate-300 text-xs font-medium leading-relaxed">
            The Google Client ID is missing. Please check your <code className="text-[#ff6b35]">.env.local</code> file and restart your development server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}