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
      className="w-[300px] md:w-[400px] h-[450px] overflow-hidden rounded-[32px] bg-black/40 backdrop-blur-lg p-5 border border-white/10 hover:border-[#ff6b35]/50 shadow-md hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col gap-4 group shrink-0 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Gallery Area */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-black/60 pointer-events-none">
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
                    sizes="(max-width: 768px) 300px, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 to-transparent opacity-60"></div>
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
                      idx === currentIndex ? "w-5 bg-[#ff6b35]" : "w-1.5 bg-white/40"
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
      <div className="flex-1 flex flex-col justify-between pointer-events-none">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#ff6b35] font-bold">Featured</p>
          <h3 className="font-display mt-1 text-2xl text-white truncate group-hover:text-[#ff6b35] transition-colors">
            {game.name}
          </h3>
          <p className="mt-2 text-sm text-slate-300 line-clamp-2 leading-relaxed font-medium">
            {game.tagline}
          </p>
        </div>
        
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white font-bold">
            {game.images.length} Highlights
          </span>
          <span className="rounded-full bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold">
            Play
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Games() {
  const [games, setGames] = useState<GroupedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const set1Ref = useRef<HTMLDivElement>(null); // Used to perfectly measure the width of one set
  
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

    // Get the EXACT pixel width of one single group of games
    const singleSetWidth = set1.offsetWidth;

    // If they scroll backward past the start, jump forward to Set 2
    if (container.scrollLeft <= 0) {
      container.scrollLeft += singleSetWidth;
      // CRITICAL FIX: If user is actively dragging when teleport happens, adjust their mouse anchor point!
      if (isDragging) setScrollLeftPos((prev) => prev + singleSetWidth);
    } 
    // If they scroll forward past Set 2, jump backward to Set 2
    else if (container.scrollLeft >= singleSetWidth * 2) {
      container.scrollLeft -= singleSetWidth;
      // CRITICAL FIX: Update mouse anchor point!
      if (isDragging) setScrollLeftPos((prev) => prev - singleSetWidth);
    }
  };

  // 🔥 Auto-Scroll Animation Engine
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || games.length === 0) return;

    let animationId: number;
    const scroll = () => {
      // Only auto-scroll if the user is completely hands-off
      if (!isInteracting && !isDragging) {
        container.scrollLeft += 0.5; // Smooth slow drift
      }
      
      handleTeleport(); // Always check if we need to loop
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isInteracting, isDragging, games.length]);

  // Set initial scroll position to the exact middle set on load
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
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    container.scrollLeft = scrollLeftPos - walk;
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center bg-transparent">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35] animate-spin"></div>
      </div>
    );
  }

  return (
    <section id="games" className="py-24 relative overflow-hidden bg-[#050505]/60 backdrop-blur-sm border-t border-b border-white/5">
      
      {/* 
        CRITICAL FIX: 
        Removed 'scroll-smooth' from CSS. It causes native browser jumping when our JS tries to teleport.
      */}
      <style>{`
        .hide-scroll-bar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scroll-bar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col lg:px-40 md:px-20 px-6 mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-[#ff6b35] font-bold drop-shadow-md">Games library</p>
        <h2 className="font-display text-4xl text-white md:text-5xl mt-2 tracking-tight font-black uppercase drop-shadow-lg">
          Trending Arsenal
        </h2>
      </div>

      {games.length === 0 ? (
        <div className="lg:mx-40 md:mx-20 mx-6 rounded-[32px] border-2 border-dashed border-white/10 bg-black/40 backdrop-blur-md py-16 text-center text-slate-300">
          <p className="text-lg">No games added yet.</p>
        </div>
      ) : (
        /* The Viewport */
        <div 
          ref={scrollContainerRef}
          onScroll={handleTeleport}
          
          // Drag Events
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeaveOrUp}
          onMouseUp={onMouseLeaveOrUp}
          onMouseMove={onMouseMove}
          
          // Touch Events
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}

          className={`flex overflow-x-auto pb-10 hide-scroll-bar px-6 md:px-20 lg:px-40 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ WebkitOverflowScrolling: 'touch' }} // Adds momentum scrolling on iOS
        >
          {/* The Track */}
          <div className="flex flex-nowrap w-max">
            
            {/* EXACT SET 1 (Used for measuring) */}
            <div ref={set1Ref} className="flex gap-6 pr-6 w-max">
              {games.map((game, idx) => (
                <GameSliderCard key={`set1-${idx}`} game={game} />
              ))}
            </div>

            {/* EXACT SET 2 */}
            <div className="flex gap-6 pr-6 w-max">
              {games.map((game, idx) => (
                <GameSliderCard key={`set2-${idx}`} game={game} />
              ))}
            </div>

            {/* EXACT SET 3 */}
            <div className="flex gap-6 pr-6 w-max">
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