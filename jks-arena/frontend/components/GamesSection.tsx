"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/auth";

interface MediaItem {
  _id: string;
  name: string;
  category: string;
  gameName: string;
  secure_url: string;
}

interface GroupedGame {
  name: string;
  tagline: string;
  category?: string; 
  images: string[];
}

function GameSliderCard({ game }: { game: GroupedGame }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-slide images inside the card
  useEffect(() => {
    if (game.images.length <= 1) return;
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % game.images.length);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [game.images.length, isHovered]);

  return (
    <div 
      className="w-[280px] md:w-[320px] rounded-3xl bg-[#0A0A0A] border-2 border-[#ff6b35]/20 hover:border-[#ff6b35]/60 shadow-[0_8px_20px_rgba(255,107,53,0.1)] transition-all duration-300 flex flex-col group shrink-0 select-none overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Gallery Area */}
      <div className="relative h-44 w-full overflow-hidden bg-black/60 pointer-events-none">
        
        {/* Heart Icon */}
        <div className="absolute top-3 right-3 z-30 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
          <svg className="w-4 h-4 text-white hover:text-[#ff6b35] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </div>

        {game.images.length > 0 ? (
          <>
            <div 
              className="flex h-full w-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {game.images.map((imgUrl, idx) => (
                <div key={idx} className="relative h-full w-full shrink-0">
                  <Image
                    src={imgUrl}
                    alt={`${game.name} - ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90"></div>
                </div>
              ))}
            </div>
            
            {/* Pagination Dots */}
            {game.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-auto">
                {game.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "w-4 bg-[#ff6b35]" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500 text-xs font-bold uppercase tracking-widest">
            No Image
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 flex flex-col justify-between p-5 pt-3 pointer-events-none bg-[#0A0A0A]">
        <div>
          <h3 className="font-bold text-lg text-white truncate group-hover:text-[#ff6b35] transition-colors">
            {game.name}
          </h3>
          <p className="mt-1 text-[11px] font-medium text-slate-400 line-clamp-1">
            {game.category || "Action • Multiplayer"}
          </p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="text-[10px] font-bold">1-4 Players</span>
           </div>
           <div className="flex items-center gap-1 text-yellow-500">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="text-[11px] font-black">4.8</span>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function GamesSection({ title }: { title?: string }) {
  const [games, setGames] = useState<GroupedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const set1Ref = useRef<HTMLDivElement>(null); 
  
  // Interaction States
  const [isInteracting, setIsInteracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media`);
        const data = await res.json();

        if (data.items) {
          const gameItems: MediaItem[] = data.items.filter(
            (item: MediaItem) => item.category === "Games"
          );

          const grouped = gameItems.reduce((acc: Record<string, GroupedGame>, item: MediaItem) => {
            if (!acc[item.gameName]) {
              acc[item.gameName] = {
                name: item.gameName,
                tagline: "Experience the ultimate gaming thrill on our premium setups.", 
                category: "Action • Adventure", // 🔥 Fallback category
                images: [],
              };
            }
            acc[item.gameName].images.push(item.secure_url);
            return acc;
          }, {});

          setGames(Object.values(grouped));
        }
      } catch (err) {
        console.error("Failed to load games:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGames();
  }, []);

  // 🔥 Flawless Teleport Logic for Infinite Looping
  const handleTeleport = () => {
    const container = scrollContainerRef.current;
    const set1 = set1Ref.current;
    
    if (!container || !set1 || games.length === 0) return;

    const singleSetWidth = set1.offsetWidth;

    if (container.scrollLeft <= 0) {
      container.scrollLeft += singleSetWidth;
      if (isDragging) setScrollLeftPos((prev) => prev + singleSetWidth);
    } 
    else if (container.scrollLeft >= singleSetWidth * 2) {
      container.scrollLeft -= singleSetWidth;
      if (isDragging) setScrollLeftPos((prev) => prev - singleSetWidth);
    }
  };

  // 🔥 Auto-Scroll Animation Engine
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || games.length === 0) return;

    let animationId: number;
    const scroll = () => {
      if (!isInteracting && !isDragging) {
        container.scrollLeft += 0.5; 
      }
      handleTeleport(); 
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isInteracting, isDragging, games.length]);

  // Set initial scroll position
  useEffect(() => {
    const container = scrollContainerRef.current;
    const set1 = set1Ref.current;
    if (container && set1 && games.length > 0) {
      setTimeout(() => {
        container.scrollLeft = set1.offsetWidth;
      }, 100);
    }
  }, [games.length]);

  // 🔥 Mouse Drag Controls
  const onMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsInteracting(true);
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeftPos(container.scrollLeft);
  };

  const onMouseLeaveOrUp = () => {
    setIsInteracting(false);
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5; 
    container.scrollLeft = scrollLeftPos - walk;
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center bg-transparent">
        <div className="h-8 w-8 rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35] animate-spin"></div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden w-full">
      <style>{`
        .hide-scroll-bar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scroll-bar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {title && (
        <div className="mb-6">
          <h2 className="font-display text-2xl text-[#1A1A1A] tracking-tight">{title}</h2>
        </div>
      )}

      {games.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#ff6b35]/20 bg-[#FDF8F5] py-12 text-center text-slate-500">
          <p className="text-sm font-bold uppercase tracking-widest">No games added yet.</p>
        </div>
      ) : (
        <div 
          ref={scrollContainerRef}
          onScroll={handleTeleport}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeaveOrUp}
          onMouseUp={onMouseLeaveOrUp}
          onMouseMove={onMouseMove}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          className={`flex overflow-x-auto pb-4 hide-scroll-bar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ WebkitOverflowScrolling: 'touch' }} 
        >
          <div className="flex flex-nowrap w-max px-2">
            {/* EXACT SET 1 (Used for measuring) */}
            <div ref={set1Ref} className="flex gap-5 pr-5 w-max">
              {games.map((game, idx) => (
                <GameSliderCard key={`set1-${idx}`} game={game} />
              ))}
            </div>

            {/* EXACT SET 2 */}
            <div className="flex gap-5 pr-5 w-max">
              {games.map((game, idx) => (
                <GameSliderCard key={`set2-${idx}`} game={game} />
              ))}
            </div>

            {/* EXACT SET 3 */}
            <div className="flex gap-5 pr-5 w-max">
              {games.map((game, idx) => (
                <GameSliderCard key={`set3-${idx}`} game={game} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}