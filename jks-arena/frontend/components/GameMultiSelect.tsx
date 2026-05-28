"use client";

import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/auth";

interface GameMultiSelectProps {
  selectedGames: string[];
  onChange: (games: string[]) => void;
  disabled?: boolean;
}

export default function GameMultiSelect({ selectedGames, onChange, disabled }: GameMultiSelectProps) {
  const [games, setGames] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media`);
        const data = await res.json();
        if (data.items) {
          const gameNames = data.items
            .filter((item: any) => item.category === "Games")
            .map((item: any) => item.gameName)
            .filter((val: string, index: number, self: string[]) => self.indexOf(val) === index);
          setGames(gameNames);
        }
      } catch (err) {
        console.error("Failed to load games for select:", err);
      }
    }
    fetchGames();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGame = (game: string) => {
    if (selectedGames.includes(game)) {
      onChange(selectedGames.filter((g) => g !== game));
    } else {
      onChange([...selectedGames, game]);
    }
  };

  const hasGames = games.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`w-full bg-white/80 border border-[#1A1A1A]/10 rounded-xl px-5 py-4 text-[#1A1A1A] font-bold cursor-pointer flex justify-between items-center transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#ff6b35]'} ${isOpen ? 'border-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.25)]' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedGames.length > 0 ? "text-[#1A1A1A]" : "text-slate-400 font-medium"}>
          {selectedGames.length > 0 
            ? selectedGames.join(", ") 
            : hasGames ? "Select Games (Optional)" : "Loading games..."}
        </span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#ff6b35]" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>

      {isOpen && hasGames && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-black/5 max-h-60 overflow-y-auto py-2 px-1">
          {games.map((game) => {
            const isSelected = selectedGames.includes(game);
            return (
              <div 
                key={game}
                onClick={() => toggleGame(game)}
                className={`flex items-center gap-3 px-4 py-3 mx-1 mb-1 rounded-lg cursor-pointer transition-all ${isSelected ? "bg-[#ff6b35]/10 text-[#ff6b35]" : "hover:bg-slate-50 text-slate-700"}`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? "border-[#ff6b35] bg-[#ff6b35]" : "border-slate-300 bg-white"}`}>
                  {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className={`font-bold text-sm ${isSelected ? "text-[#1A1A1A]" : ""}`}>{game}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
