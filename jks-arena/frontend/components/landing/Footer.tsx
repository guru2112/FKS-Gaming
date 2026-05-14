export default function Footer() {
  return (
    // 🔥 Added strong glassmorphism background
    <footer className="py-10 relative overflow-hidden bg-[#050505]/95 backdrop-blur-xl border-t border-white/10">
      
      <div className="relative z-10 text-center">
        <div className="flex justify-center gap-6 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-6">
          {["Eat", "Sleep", "Game", "Repeat"].map((word, idx) => {
            // Updated to use the Orange brand color for the third word to make it pop
            const isHighlight = word === "Game";
            return (
              <span key={word} className={`${isHighlight ? "text-[#ff6b35]" : "text-white"} transition-all duration-300 hover:scale-110 cursor-default inline-block drop-shadow-md`}>
                {word}
              </span>
            );
          })}
        </div>
        
        <div className="flex justify-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-white cursor-pointer transition-colors">Contact Us</span>
        </div>
        
        <p className="text-xs text-slate-500 font-medium tracking-wide">
          © 2026 JKS Arena Gaming Café. All rights reserved. | Built for gamers
        </p>
      </div>
    </footer>
  );
}