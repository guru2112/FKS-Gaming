"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/auth";

// ================= RULE ICONS =================

const IconNoFood = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-10 h-10"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14H16M8 10H16M10 18H14" />
    <path d="M4 4L20 20" strokeWidth="2.5" />
  </svg>
);

const IconNoAlcohol = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-10 h-10"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M10 7V17M14 7V13L16 9" />
    <path d="M4 4L20 20" strokeWidth="2.5" />
  </svg>
);

const IconNoSmoking = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-10 h-10"
  >
    <circle cx="12" cy="12" r="10" />
    <rect x="6" y="11" width="12" height="4" rx="1" />
    <path d="M16 11V15" fill="currentColor" />
    <path d="M4 4L20 20" strokeWidth="2.5" />
  </svg>
);

// ================= RULE DATA =================

const rulesData = [
  {
    title: "No Outside Food",
    desc: "Outside food & beverages are not allowed inside the cafe.",
    icon: <IconNoFood />,
  },
  {
    title: "No Alcohol",
    desc: "Strictly no alcohol allowed in the cafe.",
    icon: <IconNoAlcohol />,
  },
  {
    title: "No Smoking",
    desc: "Smoking is strictly prohibited inside the cafe.",
    icon: <IconNoSmoking />,
  },
];

// ================= INTERFACES =================

interface MediaItem {
  _id: string;
  name: string;
  category: string;
  facilityType?: string;
  description?: string;
  secure_url: string;
}

interface GroupedFacility {
  name: string;
  tagline: string;
  images: string[];
}

// ================= FACILITY CARD =================

function FacilitySliderCard({
  facility,
}: {
  facility: GroupedFacility;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (facility.images.length <= 1) return;

    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(
          (prev) => (prev + 1) % facility.images.length
        );
      }, 3000);
    }

    return () => {
      if (intervalRef.current)
        clearInterval(intervalRef.current);
    };
  }, [facility.images.length, isHovered]);

  return (
    <div
      className="w-[300px] md:w-[380px] min-h-[450px] overflow-hidden rounded-[32px] bg-black/30 backdrop-blur-lg p-5 border border-white/15 hover:border-[#ff6b35]/60 shadow-lg hover:shadow-[0_0_40px_rgba(255,107,53,0.15)] transition-all duration-300 ease-in-out flex flex-col gap-4 group shrink-0 select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE AREA */}

      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-black/30 pointer-events-none">
        {/* HEART ICON */}

        <div className="absolute top-3 right-3 z-30 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/10">
          <svg
            className="w-4 h-4 text-white hover:text-[#ff6b35] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>

        {facility.images.length > 0 ? (
          <>
            <div
              className="flex h-full w-full transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
              }}
            >
              {facility.images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative h-full w-full shrink-0"
                >
                  <Image
                    src={imgUrl}
                    alt={`${facility.name} - ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 300px, 400px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    draggable={false}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/40 to-transparent opacity-60"></div>
                </div>
              ))}
            </div>

            {/* PAGINATION DOTS */}

            {facility.images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 pointer-events-auto">
                {facility.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-5 bg-[#ff6b35]"
                        : "w-1.5 bg-white/40"
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

      {/* TEXT CONTENT */}

      <div className="flex-1 flex flex-col justify-between pointer-events-none">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#ff6b35] font-bold">
            Premium
          </p>

          <h3 className="font-display mt-2 text-3xl text-white truncate group-hover:text-[#ff6b35] transition-colors uppercase font-black">
            {facility.name}
          </h3>

          <p className="mt-3 text-base text-slate-200 line-clamp-2 leading-relaxed font-medium">
            {facility.tagline}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-white font-bold">
              {facility.images.length} Highlights
            </span>

            <span className="rounded-full bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/30 px-3 py-1.5 text-xs uppercase tracking-[0.2em] font-bold">
              Explore
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= MAIN COMPONENT =================

export default function FacilitiesSection() {
  const [facilities, setFacilities] = useState<GroupedFacility[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFacilities() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/media`);
        const data = await res.json();

        if (data.items) {
          const facItems: MediaItem[] = data.items.filter(
            (item: MediaItem) =>
              item.category === "Facilities"
          );

          const grouped = facItems.reduce(
            (
              acc: Record<string, GroupedFacility>,
              item: MediaItem
            ) => {
              const groupKey =
                item.facilityType || item.name;

              if (!acc[groupKey]) {
                acc[groupKey] = {
                  name: groupKey,
                  tagline:
                    item.description ||
                    "Experience the ultimate gaming thrill on our premium setups.",
                  images: [],
                };
              }

              acc[groupKey].images.push(
                item.secure_url
              );

              return acc;
            },
            {}
          );

          setFacilities(Object.values(grouped));
        }
      } catch (err) {
        console.error(
          "Failed to load facilities:",
          err
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchFacilities();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center bg-[#151520]">
        <div className="h-12 w-12 rounded-full border-4 border-[#ff6b35]/20 border-t-[#ff6b35] animate-spin"></div>
      </div>
    );
  }

  return (
    <section
      id="facilities"
      className="pt-24 pb-52 relative overflow-visible bg-[#151520]/40 backdrop-blur-sm border-t border-b border-white/8"
    >
      {/* TOP HEADING */}

      <div className="text-center px-6 md:px-20 lg:px-40 mb-10">
        <h1 className="font-display text-6xl md:text-8xl font-black uppercase tracking-tight leading-none">
          <span className="text-[#ff6b35]">
            Facilities
          </span>{" "}
          <span className="text-white">&</span>{" "}
          <span className="text-white">
            Rules
          </span>
        </h1>

        <div className="mt-5 space-y-2">
          <p className="text-white text-lg md:text-xl font-medium tracking-wide">
            Experience next-level gaming with premium
            setups, immersive ambience, and competitive
            vibes.
          </p>

          <p className="text-white text-sm md:text-base uppercase tracking-[0.25em]">
            Designed For Gamers • Built For Champions
          </p>
        </div>
      </div>

      {/* FACILITIES TITLE */}

      <div className="flex items-center justify-center gap-4 mb-20">
        
        <div className="h-[3px] w-28 md:w-28 bg-gradient-to-r from-transparent to-[#ff6b35]"></div>
        <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-[0.25em] text-white">
          Facilities
        </h2>

        <div className="h-[3px] w-28 md:w-28 bg-gradient-to-l from-transparent to-[#ff6b35]"></div>
      </div>

      {/* FACILITY CARDS */}

      {facilities.length === 0 ? (
        <div className="lg:mx-40 md:mx-20 mx-6 rounded-[32px] border-2 border-dashed border-white/10 bg-black/40 backdrop-blur-md py-16 text-center text-slate-300">
          <p className="text-lg">
            No facilities uploaded yet.
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE SLIDER */}

        {/* MOBILE SLIDER */}

        <div className="md:hidden overflow-x-auto overflow-y-hidden scrollbar-hide pb-20">

          <div className="flex gap-6 w-max px-6 animate-scroll-mobile">

            {[...facilities, ...facilities].map((fac, idx) => (
              <FacilitySliderCard
                 key={idx}
                  facility={fac}
              />
         ))}

          </div>

        </div>

          {/* DESKTOP GRID */}

          <div className="hidden md:flex flex-wrap justify-center gap-10 max-w-[1300px] mx-auto px-6 pb-32">
            {facilities.map((fac, idx) => (
              <FacilitySliderCard
                key={idx}
                facility={fac}
              />
            ))}
          </div>
        </>
      )}

      {/* DIVIDER LINE */}

      <div className="flex justify-center px-6 md:px-20 lg:px-40 mb-24">
        <div className="w-full max-w-[1400px] h-[3px] rounded-full bg-gradient-to-r from-transparent via-[#ff6b35] via-white to-transparent opacity-100 shadow-[0_0_35px_rgba(255,107,53,0.9)]"></div>
      </div>

      {/* RULES TITLE */}

<div className="flex flex-col items-center justify-center mb-14 px-6">

  {/* TITLE WITH LINES */}

  <div className="flex items-center justify-center gap-4 md:gap-6 w-full">

    {/* LEFT LINE */}

    <div className="flex items-center gap-3 md:gap-5">

      <div className="h-[3px] w-14 md:w-28 bg-gradient-to-r from-transparent to-white"></div>

    </div>

    {/* TITLE */}

    <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-[0.3em] text-[#ff6b35] whitespace-nowrap">
      Rules
    </h2>

    {/* RIGHT LINE */}

    <div className="flex items-center gap-3 md:gap-5">

      <div className="h-[3px] w-14 md:w-28 bg-gradient-to-l from-transparent to-white"></div>

    </div>

  </div>

  {/* SUBTEXT */}

  <p className="mt-5 text-white text-base uppercase tracking-[0.25em] text-center">
    Respect The Arena • Play Fair • Enjoy
    Responsibly
  </p>

</div>

      {/* RULES CARDS */}

      <div className="max-w-[1400px] mx-auto px-6 md:px-20 lg:px-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rulesData.map((rule, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden flex flex-col items-center text-center bg-black/35 backdrop-blur-xl border border-red-500/15 p-10 rounded-[36px] hover:border-red-500/50 transition-all duration-500 group shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-red-500/5 to-transparent"></div>

              <div className="relative z-10 text-red-500 mb-7 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                {rule.icon}
              </div>

              <h4 className="relative z-10 text-white font-black text-xl uppercase tracking-[0.2em] mb-4">
                {rule.title}
              </h4>

              <p className="relative z-10 text-slate-300 text-base leading-relaxed max-w-[250px]">
                {rule.desc}
              </p>

              <div className="relative z-10 mt-8 w-14 h-[3px] rounded-full bg-gradient-to-r from-red-500 to-[#ff6b35]"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}