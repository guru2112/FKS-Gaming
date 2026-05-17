"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser, googleAuth, API_BASE_URL } from "@/lib/auth";
import Image from "next/image";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";

// ==========================================
// 1. SIGNUP CONTENT COMPONENT
// ==========================================
function SignupContent() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [desktopImages, setDesktopImages] = useState<string[]>([]);
  const [mobileImages, setMobileImages] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

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

  useEffect(() => {
    const maxLen = Math.max(desktopImages.length, mobileImages.length);
    if (maxLen <= 1) return;
    const interval = setInterval(() => setCurrentBgIndex((prev) => (prev + 1) % maxLen), 5000);
    return () => clearInterval(interval);
  }, [desktopImages.length, mobileImages.length]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      // ✅ registerUser internally calls saveSession
      const data = await registerUser({ name, email, password });
      setMessage("Account created successfully.");
      router.push(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  }

  // 🔥 Google OAuth Logic
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setMessage(null);
      try {
        // ✅ googleAuth internally calls saveSession
        const data = await googleAuth(tokenResponse.access_token);
        router.push(data.role === "admin" ? "/admin" : "/dashboard");
      } catch (error: unknown) {
        setMessage(error instanceof Error ? error.message : "Google auth failed");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setMessage("Google Sign Up Failed"),
  });

  const clipPathStyle = {
    clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ff6b35] via-[#a33810] to-[#0A0A0A] flex flex-col relative overflow-hidden selection:bg-white selection:text-[#ff6b35]">
      
      {/* Shadows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#050505] blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#050505] blur-[150px] rounded-full pointer-events-none z-0"></div>

      <style>{`
        @keyframes pan-image { 0% { transform: scale(1.05) translateX(2%); } 100% { transform: scale(1.05) translateX(-2%); } }
        .animate-pan { animation: pan-image 20s ease-in-out infinite alternate; }
      `}</style>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 w-full">
        
        {/* Mobile Header */}
        <div className="md:hidden relative z-20 flex flex-col items-center mb-6 text-center">
          <div className="text-5xl font-black italic tracking-tighter text-white">
            JKS <span className="text-[#ff6b35]">ARENA</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 mt-2">EAT, SLEEP, GAME, REPEAT</p>
        </div>

        {/* Card */}
        <div className="relative z-10 flex flex-col md:flex-row w-full max-w-6xl rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] min-h-[600px] md:min-h-[550px]">
          
          {/* Image */}
          <div className="absolute inset-0 md:relative md:w-[60%] overflow-hidden bg-black z-0">
             <div className="w-full h-full relative">
              {(typeof window !== 'undefined' && window.innerWidth < 768 ? mobileImages : desktopImages).map((src, idx) => (
                <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBgIndex ? "opacity-100 z-10" : "opacity-0"}`}>
                  <Image src={src} alt="BG" fill className="object-cover opacity-90 animate-pan" />
                </div>
              ))}
            </div>
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-[#0A0A0A]/40 to-[#0A0A0A] z-20"></div>
          </div>

          {/* Form */}
          <div className="relative z-10 w-full md:w-[40%] flex flex-col items-center justify-center p-8 sm:p-12 md:p-12 bg-black/40 backdrop-blur-[1px] md:bg-[#0A0A0A] md:backdrop-blur-none border-t border-white/10 md:border-none">
            
            <button onClick={() => router.push("/")} className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-[#ff6b35] z-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="w-full max-w-sm">
              <div className="hidden md:flex flex-col items-center mb-10 text-center w-full">
                <div className="text-4xl lg:text-5xl font-black italic tracking-tighter text-white">
                  JKS <span className="text-[#ff6b35]">ARENA</span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.4em] text-slate-400 mt-2 block">JOIN THE SQUAD</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px]"><input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={clipPathStyle} className="w-full bg-[#0A0A0A]/90 px-5 py-3 text-xs font-bold text-white outline-none" placeholder="FULL NAME" /></div>
                <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px]"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={clipPathStyle} className="w-full bg-[#0A0A0A]/90 px-5 py-3 text-xs font-bold text-white outline-none" placeholder="EMAIL ADDRESS" /></div>
                <div style={clipPathStyle} className="bg-[#ff6b35] p-[1.5px]"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={clipPathStyle} className="w-full bg-[#0A0A0A]/90 px-5 py-3 text-xs font-bold text-white outline-none" placeholder="CREATE PASSWORD" /></div>

                <div className="flex flex-col gap-4 pt-4">
                  <button type="submit" disabled={isLoading} style={clipPathStyle} className="w-full bg-[#ff6b35] py-3.5 text-xs font-black uppercase text-white hover:bg-[#e05928] disabled:opacity-60">
                    {isLoading ? "CREATING..." : "SIGN UP"}
                  </button>
                  
                  <div className="flex items-center gap-3 my-1"><div className="flex-1 h-[1px] bg-white/10" /><span className="text-[9px] text-white/40 uppercase">OR</span><div className="flex-1 h-[1px] bg-white/10" /></div>

                  <button type="button" onClick={() => loginWithGoogle()} disabled={isLoading} style={clipPathStyle} className="w-full bg-white py-3.5 text-xs font-black uppercase text-black flex items-center justify-center gap-3">
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    CONTINUE WITH GOOGLE
                  </button>

                  <button type="button" onClick={() => router.push("/login")} className="w-full text-[9px] font-bold text-slate-400 hover:text-[#ff6b35] transition-colors uppercase tracking-widest">
                    ALREADY HAVE ACCOUNT? LOG IN
                  </button>
                </div>
                {message && <p className="text-[10px] text-center font-bold text-[#ff6b35] mt-4 uppercase tracking-widest animate-pulse">{message}</p>}
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full relative z-20 bg-[#0A0A0A]/80 backdrop-blur-md border-t border-white/10 py-6 px-6 sm:px-12 mt-auto text-center md:text-left flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-widest font-bold text-slate-400">
        <div>© {new Date().getFullYear()} JKS <span className="text-[#ff6b35]">ARENA</span></div>
        <div className="flex gap-6 mt-4 md:mt-0"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Support</a></div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return <div className="text-white p-10">Config Error: Missing Client ID</div>;
  return <GoogleOAuthProvider clientId={clientId}><SignupContent /></GoogleOAuthProvider>;
}